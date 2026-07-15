export function validateSafeCommand(command) {
  const allowed = new Set(['turn_on', 'turn_off', 'arm', 'disarm', 'open_gate', 'close_gate'])
  return allowed.has(command)
}

export async function executeSafeCommand(_config, command, params = {}) {
  if (!validateSafeCommand(command)) {
    throw new Error(`Unsupported command: ${command}`)
  }

  return {
    command,
    params,
    accepted: true,
    executedAt: new Date().toISOString(),
  }
}
