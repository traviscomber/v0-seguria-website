import type { SpeciesLocalization } from '@/lib/wildlife/species-localization'

export function SpeciesTaxonomyPanel({ species }: { species: SpeciesLocalization }) {
  const taxonomy = species.taxonomy
  const hasDetails = taxonomy || species.conservationStatus || species.diet || species.activity || species.localHabitat || species.diagnosticTraits?.length || species.confusableWith?.length
  if (!hasDetails) return null

  return (
    <details className="border-t border-white/8 bg-white/[0.015]">
      <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-[#9bd3f3] marker:hidden">
        Ver detalles taxonomicos y ecologicos
      </summary>
      <div className="border-t border-white/8 p-5">
        {taxonomy && (
          <div>
            <p className="text-[11px] uppercase tracking-[0.13em] text-white/30">Clasificacion taxonomica</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <Taxon label="Reino" value={taxonomy.kingdom} />
              <Taxon label="Filo" value={taxonomy.phylum} />
              <Taxon label="Clase" value={taxonomy.className} />
              <Taxon label="Orden" value={taxonomy.order} />
              <Taxon label="Familia" value={taxonomy.family} />
              <Taxon label="Genero" value={taxonomy.genus} italic />
            </div>
          </div>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Fact label="Conservacion" value={species.conservationStatus} />
          <Fact label="Dieta" value={species.diet} />
          <Fact label="Actividad" value={species.activity} />
          <Fact label="Prioridad de revision" value={species.reviewPriority ? species.reviewPriority.toUpperCase() : undefined} />
        </div>

        {species.localHabitat && (
          <div className="mt-5">
            <p className="text-[11px] uppercase tracking-[0.13em] text-white/30">Habitat probable en Huilo Huilo</p>
            <p className="mt-2 text-sm leading-6 text-white/60">{species.localHabitat}</p>
          </div>
        )}

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {!!species.diagnosticTraits?.length && (
            <div>
              <p className="text-[11px] uppercase tracking-[0.13em] text-white/30">Rasgos diagnosticos</p>
              <ul className="mt-2 space-y-1.5 text-sm text-white/60">
                {species.diagnosticTraits.map((trait) => <li key={trait}>- {trait}</li>)}
              </ul>
            </div>
          )}
          {!!species.confusableWith?.length && (
            <div>
              <p className="text-[11px] uppercase tracking-[0.13em] text-white/30">Puede confundirse con</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {species.confusableWith.map((value) => <span key={value} className="rounded-full border border-amber-300/15 bg-amber-300/[0.05] px-2.5 py-1 text-xs text-amber-100/70">{value}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </details>
  )
}

function Taxon({ label, value, italic = false }: { label: string; value: string; italic?: boolean }) {
  return <div className="rounded-lg border border-white/8 bg-[#071622] px-3 py-2.5"><p className="text-[10px] uppercase tracking-[0.12em] text-white/25">{label}</p><p className={`mt-1 text-sm text-white/75 ${italic ? 'italic' : ''}`}>{value}</p></div>
}

function Fact({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return <div className="rounded-lg border border-white/8 bg-[#071622] px-3 py-3"><p className="text-[10px] uppercase tracking-[0.12em] text-white/25">{label}</p><p className="mt-1 text-sm text-white/75">{value}</p></div>
}
