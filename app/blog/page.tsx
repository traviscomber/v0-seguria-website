import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Calendar, ArrowRight } from 'lucide-react'

const posts = [
  {
    slug: 'reconocimiento-pumas',
    title: 'Reconocimiento de pumas en tiempo real: cómo funciona en SegurIA',
    excerpt: 'La seguridad en campos remotos enfrenta un desafío único en el sur de Chile. No se trata solo de vigilancia humana, sino de identificar amenazas reales vs ruido.',
    date: '23 de julio, 2026',
    readTime: '8 min',
    category: 'Seguridad'
  },
  {
    slug: 'reducir-falsas-alarmas',
    title: 'Cómo reducir falsas alarmas en 85% sin sacrificar protección',
    excerpt: 'La mayoría de sistemas generan 10-15 falsas alarmas por cada incidente real. Aquí te mostramos cómo IA y contexto cambian eso.',
    date: '20 de julio, 2026',
    readTime: '6 min',
    category: 'Operación'
  },
  {
    slug: 'tuya-vs-home-assistant',
    title: 'Tuya vs Home Assistant: Cuál elegir para seguridad rural',
    excerpt: 'Comparativa honesta entre los dos ecosistemas smart home más populares en Chile. Ventajas, limitaciones y cuándo cada uno tiene sentido.',
    date: '18 de julio, 2026',
    readTime: '10 min',
    category: 'Integración'
  },
]

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <Navigation />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-light text-white text-balance mb-6">
            Historias de seguridad real
          </h1>
          <p className="text-xl text-white/70 text-balance">
            Guías prácticas, casos reales y aprendizajes de implementar seguridad inteligente en Chile.
          </p>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="pb-24 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <article className="h-full rounded-lg border border-white/10 bg-white/[0.05] p-8 backdrop-blur hover:border-[#4DA3D9]/50 transition-colors cursor-pointer flex flex-col">
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#4DA3D9]/20 text-[#9DD2F2] text-xs uppercase tracking-wider font-medium">
                      {post.category}
                    </span>
                  </div>

                  <h2 className="text-2xl font-light text-white mb-4 flex-grow">
                    {post.title}
                  </h2>

                  <p className="text-white/70 mb-6 leading-relaxed">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-white/10">
                    <div className="flex items-center gap-4 text-xs text-white/50">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {post.date}
                      </span>
                      <span>{post.readTime}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#4DA3D9] group-hover:translate-x-1 transition-transform" />
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
