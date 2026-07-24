import Link from 'next/link'
import { Headphones } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DashboardSupport() {
  return (
    <Card className="border-[#4DA3D9]/25 bg-[#4DA3D9]/8">
      <CardHeader>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#4DA3D9]/15 text-[#9DD2F2]">
          <Headphones className="h-5 w-5" />
        </div>
        <CardTitle className="pt-3 text-2xl font-light text-white">¿Necesitas ayuda?</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-white/55">
          Contacta al equipo de SegurIA para reportar un problema, solicitar una revisión o resolver una duda sobre tu servicio.
        </p>
        <Button asChild className="mt-5 w-full bg-[#4DA3D9] text-[#06111D] hover:bg-[#6BB6E5]">
          <Link href="/contacto">Contactar soporte</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
