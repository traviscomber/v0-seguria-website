export type EmbeddedImageMetadata = {
  available: boolean
  source: 'exif' | 'none'
  capturedAt: string | null
  latitude: number | null
  longitude: number | null
  orientation: number | null
  cameraMake: string | null
  cameraModel: string | null
  issues: string[]
}

type EndianReader = {
  u16: (offset: number) => number
  u32: (offset: number) => number
}

function parseExifDate(value: string | null) {
  if (!value) return null
  const match = value.trim().match(/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/)
  if (!match) return null
  const [, year, month, day, hour, minute, second] = match
  const parsed = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

function readAscii(buffer: Buffer, offset: number, length: number) {
  if (offset < 0 || length <= 0 || offset + length > buffer.length) return null
  return buffer.subarray(offset, offset + length).toString('ascii').replace(/\0+$/, '').trim() || null
}

function readRational(reader: EndianReader, buffer: Buffer, offset: number) {
  if (offset < 0 || offset + 8 > buffer.length) return null
  const numerator = reader.u32(offset)
  const denominator = reader.u32(offset + 4)
  return denominator ? numerator / denominator : null
}

function parseIfd(buffer: Buffer, tiffStart: number, ifdOffset: number, reader: EndianReader) {
  const absolute = tiffStart + ifdOffset
  if (absolute < 0 || absolute + 2 > buffer.length) return new Map<number, { type: number; count: number; valueOffset: number; entryOffset: number }>()
  const count = reader.u16(absolute)
  const entries = new Map<number, { type: number; count: number; valueOffset: number; entryOffset: number }>()
  for (let index = 0; index < count; index += 1) {
    const entryOffset = absolute + 2 + index * 12
    if (entryOffset + 12 > buffer.length) break
    entries.set(reader.u16(entryOffset), {
      type: reader.u16(entryOffset + 2),
      count: reader.u32(entryOffset + 4),
      valueOffset: reader.u32(entryOffset + 8),
      entryOffset,
    })
  }
  return entries
}

function valueLocation(entry: { type: number; count: number; valueOffset: number; entryOffset: number }, tiffStart: number) {
  const sizes: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8 }
  const size = (sizes[entry.type] || 1) * entry.count
  return size <= 4 ? entry.entryOffset + 8 : tiffStart + entry.valueOffset
}

function gpsCoordinate(
  entries: Map<number, { type: number; count: number; valueOffset: number; entryOffset: number }>,
  valueTag: number,
  refTag: number,
  tiffStart: number,
  reader: EndianReader,
  buffer: Buffer,
) {
  const valueEntry = entries.get(valueTag)
  const refEntry = entries.get(refTag)
  if (!valueEntry || !refEntry || valueEntry.type !== 5 || valueEntry.count < 3) return null
  const offset = valueLocation(valueEntry, tiffStart)
  const degrees = readRational(reader, buffer, offset)
  const minutes = readRational(reader, buffer, offset + 8)
  const seconds = readRational(reader, buffer, offset + 16)
  const ref = readAscii(buffer, valueLocation(refEntry, tiffStart), Math.max(1, refEntry.count))
  if (degrees === null || minutes === null || seconds === null || !ref) return null
  const sign = ['S', 'W'].includes(ref.toUpperCase()) ? -1 : 1
  return sign * (degrees + minutes / 60 + seconds / 3600)
}

export function extractEmbeddedImageMetadata(buffer: Buffer, mimeType: string): EmbeddedImageMetadata {
  const empty: EmbeddedImageMetadata = {
    available: false,
    source: 'none',
    capturedAt: null,
    latitude: null,
    longitude: null,
    orientation: null,
    cameraMake: null,
    cameraModel: null,
    issues: [],
  }

  if (mimeType !== 'image/jpeg' || buffer.length < 12 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return { ...empty, issues: ['No se encontro metadata EXIF JPEG compatible.'] }
  }

  try {
    let cursor = 2
    while (cursor + 4 < buffer.length) {
      if (buffer[cursor] !== 0xff) break
      const marker = buffer[cursor + 1]
      if (marker === 0xda || marker === 0xd9) break
      const segmentLength = buffer.readUInt16BE(cursor + 2)
      if (segmentLength < 2 || cursor + 2 + segmentLength > buffer.length) break

      if (marker === 0xe1 && buffer.subarray(cursor + 4, cursor + 10).toString('ascii') === 'Exif\0\0') {
        const tiffStart = cursor + 10
        const byteOrder = buffer.subarray(tiffStart, tiffStart + 2).toString('ascii')
        const little = byteOrder === 'II'
        if (!little && byteOrder !== 'MM') return { ...empty, issues: ['Orden de bytes EXIF invalido.'] }
        const reader: EndianReader = {
          u16: (offset) => little ? buffer.readUInt16LE(offset) : buffer.readUInt16BE(offset),
          u32: (offset) => little ? buffer.readUInt32LE(offset) : buffer.readUInt32BE(offset),
        }
        if (reader.u16(tiffStart + 2) !== 42) return { ...empty, issues: ['Cabecera TIFF EXIF invalida.'] }

        const root = parseIfd(buffer, tiffStart, reader.u32(tiffStart + 4), reader)
        const readEntryAscii = (tag: number) => {
          const entry = root.get(tag)
          return entry ? readAscii(buffer, valueLocation(entry, tiffStart), entry.count) : null
        }
        const orientationEntry = root.get(0x0112)
        const orientation = orientationEntry ? reader.u16(valueLocation(orientationEntry, tiffStart)) : null

        let capturedAt = parseExifDate(readEntryAscii(0x0132))
        const exifPointer = root.get(0x8769)
        if (exifPointer) {
          const exifIfd = parseIfd(buffer, tiffStart, exifPointer.valueOffset, reader)
          const dateEntry = exifIfd.get(0x9003) || exifIfd.get(0x9004)
          if (dateEntry) capturedAt = parseExifDate(readAscii(buffer, valueLocation(dateEntry, tiffStart), dateEntry.count)) || capturedAt
        }

        let latitude: number | null = null
        let longitude: number | null = null
        const gpsPointer = root.get(0x8825)
        if (gpsPointer) {
          const gps = parseIfd(buffer, tiffStart, gpsPointer.valueOffset, reader)
          latitude = gpsCoordinate(gps, 0x0002, 0x0001, tiffStart, reader, buffer)
          longitude = gpsCoordinate(gps, 0x0004, 0x0003, tiffStart, reader, buffer)
        }

        const metadata: EmbeddedImageMetadata = {
          available: true,
          source: 'exif',
          capturedAt,
          latitude,
          longitude,
          orientation,
          cameraMake: readEntryAscii(0x010f),
          cameraModel: readEntryAscii(0x0110),
          issues: [],
        }
        if (!capturedAt) metadata.issues.push('EXIF sin fecha de captura valida.')
        if (latitude === null || longitude === null) metadata.issues.push('EXIF sin coordenadas GPS completas.')
        return metadata
      }
      cursor += 2 + segmentLength
    }
    return { ...empty, issues: ['La imagen no contiene un bloque EXIF.'] }
  } catch {
    return { ...empty, issues: ['No fue posible interpretar la metadata EXIF.'] }
  }
}
