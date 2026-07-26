type GreenApiConfig = {
  instanceId: string
  token: string
}

function getConfig(): GreenApiConfig {
  const instanceId = process.env.GREEN_API_INSTANCE_ID
  const token = process.env.GREEN_API_TOKEN

  if (!instanceId || !token) {
    throw new Error('Green API is not configured')
  }

  return { instanceId, token }
}

export async function sendGreenApiMessage(chatId: string, message: string) {
  const { instanceId, token } = getConfig()
  const response = await fetch(
    `https://api.green-api.com/waInstance${instanceId}/sendMessage/${token}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, message }),
      signal: AbortSignal.timeout(15_000),
    },
  )

  if (!response.ok) {
    const details = await response.text().catch(() => '')
    throw new Error(`Green API sendMessage failed: ${response.status} ${details}`)
  }

  return response.json() as Promise<{ idMessage?: string }>
}

export function normalizeGreenApiText(payload: unknown) {
  if (!payload || typeof payload !== 'object') return null

  const body = payload as Record<string, any>
  if (body.typeWebhook !== 'incomingMessageReceived') return null

  const chatId = body.senderData?.chatId
  const messageData = body.messageData
  const type = messageData?.typeMessage
  const text =
    type === 'textMessage'
      ? messageData?.textMessageData?.textMessage
      : type === 'extendedTextMessage'
        ? messageData?.extendedTextMessageData?.text
        : null

  if (typeof chatId !== 'string' || typeof text !== 'string' || !text.trim()) {
    return null
  }

  return {
    chatId,
    text: text.trim(),
    messageId: typeof body.idMessage === 'string' ? body.idMessage : undefined,
    senderName:
      body.senderData?.senderContactName ||
      body.senderData?.senderName ||
      body.senderData?.chatName ||
      undefined,
  }
}
