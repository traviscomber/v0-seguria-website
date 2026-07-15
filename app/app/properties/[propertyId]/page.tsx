import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { getAuthSessionFromToken, canAccessProperty } from '@/lib/auth-store'

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ propertyId: string }>
}) {
  const { propertyId } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('seguria_session')?.value || null
  if (!token) {
    redirect(`/login?next=/app/properties/${propertyId}`)
  }

  const session = await getAuthSessionFromToken(token)
  if (!session) {
    redirect(`/login?next=/app/properties/${propertyId}`)
  }

  const user = session.user
  if (!canAccessProperty(user, propertyId)) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-[#0A1B2E] p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <Link href="/app" className="text-[#4DA3D9] text-sm hover:underline">
            Volver al portal
          </Link>
          <h1 className="text-3xl font-light text-white mt-3">{propertyId}</h1>
          <p className="text-white/55 mt-2">Vista de propiedad con scope de tenant.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-card p-6">
            <p className="text-white/55 text-sm">Estado</p>
            <p className="text-white text-2xl font-light mt-2">Online</p>
          </div>
          <div className="glass-card p-6">
            <p className="text-white/55 text-sm">Usuario</p>
            <p className="text-white text-2xl font-light mt-2">{user.name}</p>
          </div>
          <div className="glass-card p-6">
            <p className="text-white/55 text-sm">Rol</p>
            <p className="text-white text-2xl font-light mt-2">{user.role}</p>
          </div>
        </div>
      </div>
    </main>
  )
}
