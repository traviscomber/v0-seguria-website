'use client'

import { MapPin } from 'lucide-react'

export function TerritorialMapShortcut() {
  function openMap() {
    document.getElementById('territorial-map')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <button
      type="button"
      onClick={openMap}
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-[#8fc8ea]/30 bg-[#0b1d2c]/95 px-4 py-3 text-sm font-medium text-[#b7def5] shadow-2xl shadow-black/40 backdrop-blur transition hover:border-[#8fc8ea]/50 hover:bg-[#123047] focus:outline-none focus:ring-2 focus:ring-[#8fc8ea]/30"
      aria-label="Abrir mapa territorial"
    >
      <MapPin className="h-4 w-4" />
      <span className="hidden sm:inline">Mapa territorial</span>
    </button>
  )
}
