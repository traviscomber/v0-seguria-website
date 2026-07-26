import { createClient } from '@supabase/supabase-js'

type StoredMessage = {
  role: 'user' | 'assistant'
  content: string
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) return null

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function getConversationHistory(chatId: string): Promise<StoredMessage[]> {
  const supabase = getAdminClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('whatsapp_sales_messages')
    .select('role, content')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false })
    .limit(12)

  if (error) {
    console.error('[whatsapp] history read failed', error.message)
    return []
  }

  return (data ?? []).reverse() as StoredMessage[]
}

export async function saveConversationMessage(params: {
  chatId: string
  role: 'user' | 'assistant'
  content: string
  externalMessageId?: string
  senderName?: string
}) {
  const supabase = getAdminClient()
  if (!supabase) return

  const { error } = await supabase.from('whatsapp_sales_messages').insert({
    chat_id: params.chatId,
    role: params.role,
    content: params.content,
    external_message_id: params.externalMessageId,
    sender_name: params.senderName,
  })

  if (error && error.code !== '23505') {
    console.error('[whatsapp] message save failed', error.message)
  }
}

export async function recordEscalation(params: {
  chatId: string
  senderName?: string
  summary: string
}) {
  const supabase = getAdminClient()
  if (!supabase) return

  const { error } = await supabase.from('whatsapp_sales_leads').upsert(
    {
      chat_id: params.chatId,
      sender_name: params.senderName,
      status: 'needs_human',
      summary: params.summary,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'chat_id' },
  )

  if (error) console.error('[whatsapp] escalation save failed', error.message)
}
