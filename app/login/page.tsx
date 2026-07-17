import { LoginForm } from '@/components/login-form'

export const dynamic = 'force-dynamic'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; registered?: string }>
}) {
  const params = await searchParams
  const nextPath = params.next || '/app'

  return <LoginForm nextPath={nextPath} registered={params.registered === '1'} />
}
