const NORMALIZED_LICENSES = [
  { pattern: /creativecommons\.org\/publicdomain\/zero\//i, code: 'CC0', commercial: true, derivatives: true },
  { pattern: /creativecommons\.org\/licenses\/by\/4\.0/i, code: 'CC-BY-4.0', commercial: true, derivatives: true },
  { pattern: /creativecommons\.org\/licenses\/by\/3\.0/i, code: 'CC-BY-3.0', commercial: true, derivatives: true },
  { pattern: /creativecommons\.org\/licenses\/by-sa\/4\.0/i, code: 'CC-BY-SA-4.0', commercial: true, derivatives: true },
  { pattern: /creativecommons\.org\/licenses\/by-sa\/3\.0/i, code: 'CC-BY-SA-3.0', commercial: true, derivatives: true },
  { pattern: /creativecommons\.org\/licenses\/by-nc/i, code: 'CC-BY-NC', commercial: false, derivatives: true },
  { pattern: /creativecommons\.org\/licenses\/by-nd/i, code: 'CC-BY-ND', commercial: true, derivatives: false },
  { pattern: /creativecommons\.org\/licenses\/by-nc-nd/i, code: 'CC-BY-NC-ND', commercial: false, derivatives: false },
]

export function classifyMediaLicense(value) {
  const license = String(value || '').trim()
  const match = NORMALIZED_LICENSES.find((candidate) => candidate.pattern.test(license))

  if (!match) {
    return {
      code: license || null,
      verified: false,
      commercialUseAllowed: false,
      derivativesAllowed: false,
      trainingEligible: false,
    }
  }

  return {
    code: match.code,
    verified: true,
    commercialUseAllowed: match.commercial,
    derivativesAllowed: match.derivatives,
    trainingEligible: match.commercial && match.derivatives,
  }
}
