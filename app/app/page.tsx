import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAuthSessionFromToken } from '@/lib/auth-store'

export default async function ClientAppPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('seguria_session')?.value || null
  if (!token) {
    redirect('/login?next=/app')
  }

  const session = await getAuthSessionFromToken(token)
  if (!session || session.user.role === 'admin') {
    redirect('/login?next=/app')
  }

  const user = session.user

  return (
    <main className="min-h-screen bg-[#0A1B2E] p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <p className="text-[#4DA3D9] text-sm">Portal cliente</p>
          <h1 className="text-3xl font-light text-white mt-2">Bienvenido, {user.name}</h1>
          <p className="text-white/55 mt-2 text-sm">
            Vista acotada por tenant para tus propiedades y dispositivos.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-card p-6">
            <p className="text-white/55 text-sm">Rol</p>
            <p className="text-white text-2xl font-light mt-2">{user.role}</p>
          </div>
          <div className="glass-card p-6">
            <p className="text-white/55 text-sm">Clientes vinculados</p>
            <p className="text-white text-2xl font-light mt-2">{user.clientIds.length}</p>
          </div>
          <div className="glass-card p-6">
            <p className="text-white/55 text-sm">Propiedades</p>
            <p className="text-white text-2xl font-light mt-2">{user.propertyIds.length}</p>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-light text-white mb-4">Tus propiedades</h2>
          {user.propertyIds.length === 0 ? (
            <p className="text-white/55">No tienes propiedades asociadas.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.propertyIds.map((propertyId) => (
                <Link
                  key={propertyId}
                  href={`/app/properties/${propertyId}`}
                  className="rounded-[5px] bg-white/5 p-4 hover:bg-white/10 transition-colors"
                >
                  <p className="text-white font-light">{propertyId}</p>
                  <p className="text-white/50 text-sm mt-1">Ver estado y dispositivos</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
