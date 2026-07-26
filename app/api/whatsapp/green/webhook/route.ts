import { NextRequest, NextResponse } from 'next/server'
import { runSeguriaSalesAgent } from '@/lib/agents/seguria-sales-agent'
import {
  getConversationHistory,
  recordEscalation,
  saveConversationMessage,
} from '@/lib/agents/seguria-conversation-store'
import {
  normalizeGreenApiText,
  sendGreenApiMessage,
} from '@/lib/whatsapp/green-api'

export const runtime = 'nodejs'
export const maxDuration = 60

function isAuthorized(request: NextRequest) {
  const expected = process.env.GREEN_API_WEBHOOK_SECRET
  if (!expected) return process.env.NODE_ENV !== 'production'

  const supplied =
    request.nextUrl.searchParams.get('token') ||
    request.headers.get('x-webhook-secret')

  return supplied === expected
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  return NextResponse.json({
    ok: true,
    service: 'seguria-green-api-sales-agent',
  })
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  try {
    const payload = await request.json()
    const incoming = normalizeGreenApiText(payload)

    if (!incoming) {
      return NextResponse.json({ ok: true, ignored: true })
    }

    const history = await getConversationHistory(incoming.chatId)

    await saveConversationMessage({
      chatId: incoming.chatId,
      role: 'user',
      content: incoming.text,
      externalMessageId: incoming.messageId,
      senderName: incoming.senderName,
    })

    const result = await runSeguriaSalesAgent({
      customerMessage: incoming.text,
      customerName: incoming.senderName,
      history,
    })

    const outbound = await sendGreenApiMessage(incoming.chatId, result.message)

    await saveConversationMessage({
      chatId: incoming.chatId,
      role: 'assistant',
      content: result.message,
      externalMessageId: outbound.idMessage,
    })

    if (result.shouldEscalate) {
      await recordEscalation({
        chatId: incoming.chatId,
        senderName: incoming.senderName,
        summary: `El agente detectó intención comercial alta. Último mensaje: ${incoming.text.slice(0, 500)}`,
      })

      const escalationChatId = process.env.SALES_ESCALATION_CHAT_ID
      if (escalationChatId) {
        await sendGreenApiMessage(
          escalationChatId,
          [
            '🔥 Lead calificado por el agente SegurIA',
            `Contacto: ${incoming.senderName || 'Sin nombre'}`,
            `Chat: ${incoming.chatId}`,
            `Último mensaje: ${incoming.text.slice(0, 700)}`,
            'Revisar y tomar control de la conversación.',
          ].join('\n'),
        )
      }
    }

    return NextResponse.json({
      ok: true,
      replied: true,
      escalated: result.shouldEscalate,
    })
  } catch (error) {
    console.error('[whatsapp] webhook failed', error)
    return NextResponse.json(
      { ok: false, error: 'Unable to process WhatsApp message' },
      { status: 500 },
    )
  }
}
