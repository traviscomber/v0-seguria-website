import process from 'node:process'
import { classifyMediaLicense } from './gbif-license.mjs'

const GBIF_ENDPOINT = 'https://api.gbif.org/v1/occurrence/search'
const HUILO_HUILO_GEOMETRY = 'POLYGON((-72.15 -40.05,-71.70 -40.05,-71.70 -39.65,-72.15 -39.65,-72.15 -40.05))'
const PAGE_SIZE = 100

function parseArgs(argv) {
  return {
    limit: Number(argv.find((arg) => arg.startsWith('--limit='))?.split('=')[1] || 500),
    commit: argv.includes('--commit'),
  }
}

function normalizeMedia(media = []) {
  return media
    .filter((item) => item.type === 'StillImage' && item.identifier)
    .map((item) => {
      const license = classifyMediaLicense(item.license)
      return {
        source_media_id: item.identifier,
        media_type: 'image',
        identifier_url: item.identifier,
        reference_url: item.references || null,
        mime_type: item.format || null,
        creator: item.creator || null,
        rights_holder: item.rightsHolder || null,
        license_url: item.license || null,
        license_code: license.code,
        commercial_use_allowed: license.commercialUseAllowed,
        derivatives_allowed: license.derivativesAllowed,
        license_verified: license.verified,
        training_eligible: false,
        rejection_reason: license.trainingEligible ? 'awaiting_human_review' : 'license_not_training_compatible',
        raw_media: item,
      }
    })
}

function normalizeOccurrence(record) {
  const media = normalizeMedia(record.media)
  return {
    source_name: 'GBIF',
    source_occurrence_id: String(record.key),
    scientific_name: record.species || record.scientificName || null,
    occurrence_status: 'candidate',
    basis_of_record: record.basisOfRecord || null,
    observed_at: record.eventDate || null,
    latitude: record.decimalLatitude ?? null,
    longitude: record.decimalLongitude ?? null,
    coordinate_uncertainty_meters: record.coordinateUncertaintyInMeters ?? null,
    locality: record.locality || record.stateProvince || null,
    country_code: record.countryCode || null,
    occurrence_license: record.license || null,
    occurrence_rights_holder: record.rightsHolder || null,
    occurrence_reference_url: record.references || null,
    research_grade: Boolean(record.issues?.length === 0 && record.decimalLatitude && record.decimalLongitude),
    raw_record: record,
    media,
  }
}

async function fetchOccurrences(limit) {
  const results = []
  let offset = 0

  while (results.length < limit) {
    const pageLimit = Math.min(PAGE_SIZE, limit - results.length)
    const url = new URL(GBIF_ENDPOINT)
    url.searchParams.set('geometry', HUILO_HUILO_GEOMETRY)
    url.searchParams.set('mediaType', 'StillImage')
    url.searchParams.set('limit', String(pageLimit))
    url.searchParams.set('offset', String(offset))

    const response = await fetch(url, {
      headers: { 'User-Agent': 'SegurIA-Wildlife/1.0 (dataset enrichment)' },
    })
    if (!response.ok) throw new Error(`GBIF request failed: ${response.status}`)

    const payload = await response.json()
    results.push(...payload.results)
    offset += payload.results.length
    if (payload.endOfRecords || payload.results.length === 0) break
  }

  return results.map(normalizeOccurrence)
}

async function writeToSupabase(records) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
  if (!url || !serviceKey) throw new Error('Supabase admin credentials are required for --commit')

  const regionResponse = await fetch(`${url}/rest/v1/wildlife_regions?slug=eq.huilo-huilo&select=id`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  })
  const [region] = await regionResponse.json()
  if (!region?.id) throw new Error('Huilo Huilo region not found')

  for (const record of records) {
    if (!record.scientific_name) continue

    const taxonResponse = await fetch(
      `${url}/rest/v1/wildlife_taxa?scientific_name=eq.${encodeURIComponent(record.scientific_name)}&select=id`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
    )
    const [taxon] = await taxonResponse.json()
    if (!taxon?.id) continue

    const occurrencePayload = {
      region_id: region.id,
      taxon_id: taxon.id,
      source_name: record.source_name,
      source_occurrence_id: record.source_occurrence_id,
      occurrence_status: record.occurrence_status,
      basis_of_record: record.basis_of_record,
      observed_at: record.observed_at,
      latitude: record.latitude,
      longitude: record.longitude,
      coordinate_uncertainty_meters: record.coordinate_uncertainty_meters,
      locality: record.locality,
      country_code: record.country_code,
      occurrence_license: record.occurrence_license,
      occurrence_rights_holder: record.occurrence_rights_holder,
      occurrence_reference_url: record.occurrence_reference_url,
      research_grade: record.research_grade,
      raw_record: record.raw_record,
    }

    const occurrenceResponse = await fetch(`${url}/rest/v1/wildlife_occurrences?on_conflict=source_name,source_occurrence_id`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify(occurrencePayload),
    })
    const [occurrence] = await occurrenceResponse.json()
    if (!occurrence?.id) continue

    for (const media of record.media) {
      await fetch(`${url}/rest/v1/wildlife_occurrence_media?on_conflict=occurrence_id,identifier_url`, {
        method: 'POST',
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify({ ...media, occurrence_id: occurrence.id }),
      })
    }
  }
}

const args = parseArgs(process.argv.slice(2))
const records = await fetchOccurrences(args.limit)

const summary = {
  records: records.length,
  media: records.reduce((sum, record) => sum + record.media.length, 0),
  license_compatible_media: records.reduce(
    (sum, record) => sum + record.media.filter((media) => media.license_verified && media.commercial_use_allowed && media.derivatives_allowed).length,
    0
  ),
  mode: args.commit ? 'commit' : 'dry-run',
}

console.log(JSON.stringify(summary, null, 2))

if (args.commit) {
  await writeToSupabase(records)
  console.log('GBIF import completed. All records remain candidates pending human review.')
}
