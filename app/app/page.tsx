import { redirect } from 'next/navigation'
import { LogOut, Menu, Bell, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentAuthSession } from '@/lib/auth-store'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function ClientAppPage() {
  const session = await getCurrentAuthSession()
  if (!session || session.user.role !== 'client') {
    redirect('/login?next=/app')
  }

  // Get user and operation info
  const supabase = await createSupabaseServerClient()
  
  let userProfile = null
  let operations = []
  
  if (supabase) {
    try {
      // @ts-ignore
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
      userProfile = user
    } catch {
      userProfile = null
    }

    try {
      // @ts-ignore
      const { data: ops } = await supabase
        .from('user_operations')
        .select('operation_id, operations(id, name, type, location, description)')
        .eq('user_id', session.user.id)
      operations = ops || []
    } catch {
      operations = []
    }
  }

  const operation = (operations as any)?.[0]?.operations

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600" />
            <div>
              <h1 className="font-bold text-lg text-white">SEGURIA</h1>
              <p className="text-xs text-slate-400">Sistema de Seguridad Operacional</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-2">Bienvenido</h2>
          <p className="text-slate-400">
            {userProfile?.full_name || 'Usuario'} · {operation?.name || 'Operación'}
          </p>
        </div>

        {/* Operation Card */}
        {operation && (
          <Card className="mb-8 border-slate-700 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-white">{operation.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Tipo</p>
                  <p className="text-white font-semibold capitalize">{operation.type}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Ubicación</p>
                  <p className="text-white font-semibold">{operation.location}</p>
                </div>
              </div>
              {operation.description && (
                <div>
                  <p className="text-sm text-slate-400">Descripción</p>
                  <p className="text-white">{operation.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition">
            <CardHeader>
              <CardTitle className="text-white text-lg">Alertas Activas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-400">0</p>
              <p className="text-sm text-slate-400 mt-2">Todo en orden</p>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition">
            <CardHeader>
              <CardTitle className="text-white text-lg">Estado del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <p className="text-white font-semibold">Operativo</p>
              </div>
              <p className="text-sm text-slate-400 mt-2">Última actualización: hace 2 min</p>
            </CardContent>
          </Card>
        </div>

        {/* Status Info */}
        <Card className="mt-8 border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-white">Información de Sesión</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <p className="text-slate-400">Email</p>
              <p className="text-white font-mono">{session.user.email}</p>
            </div>
            <div className="text-sm">
              <p className="text-slate-400">Rol</p>
              <p className="text-white capitalize">{session.user.role}</p>
            </div>
            <div className="text-sm">
              <p className="text-slate-400">Sesión activa desde</p>
              <p className="text-white">{new Date(session.session.createdAt).toLocaleDateString('es-CL')}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
