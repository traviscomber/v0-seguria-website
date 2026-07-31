export interface VisionProviderState {
  onnxReady: boolean
  openaiReady: boolean
  openaiModel?: string
}

export type VisionProvider = 'onnx' | 'openai' | null

export function selectVisionProvider(state: VisionProviderState): VisionProvider {
  // Prefer OpenAI as ONNX is not yet implemented
  if (state.openaiReady) return 'openai'
  if (state.onnxReady) return 'onnx'
  return null
}

export function visionProviderEndpoint(provider: VisionProvider): string | null {
  if (provider === 'onnx') return '/api/vision/infer'
  if (provider === 'openai') return '/api/vision/openai/infer-with-metadata'
  return null
}

export function visionProviderLabel(provider: VisionProvider, openaiModel?: string): string {
  if (provider === 'onnx') return 'Detector ONNX local'
  if (provider === 'openai') return `OpenAI Vision + EXIF${openaiModel ? ` · ${openaiModel}` : ''}`
  return 'Ningun proveedor configurado'
}
