import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import type { NextRequest } from 'next/server'

export type AuthRole = 'client' | 'technician' | 'admin'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: AuthRole
  clientIds: string[]
  propertyIds: string[]
  passwordSalt: string
  passwordHash: string
  createdAt: string
  updatedAt: string
}

export interface AuthSession {
  token: string
  userId: string
  expiresAt: string
  createdAt: string
}

type AuthState = {
  users: AuthUser[]
  sessions: AuthSession[]
}

const AUTH_FILE = process.env.SEGURIA_AUTH_FILE || path.join(os.homedir(), '.seguria', 'auth-state.json')
const SESSION_COOKIE = 'seguria_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7

function nowIso() {
  return new Date().toISOString()
}

function createId() {
  return crypto.randomBytes(16).toString('hex')
}

function hashPassword(password: string, salt: string) {
  return crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex')
}

async function ensureStateFile() {
  try {
    await fs.access(AUTH_FILE)
  } catch {
    await fs.mkdir(path.dirname(AUTH_FILE), { recursive: true })
    const seed = createSeedState()
    await fs.writeFile(AUTH_FILE, JSON.stringify(seed, null, 2), 'utf8')
  }
}

function createSeedUser(input: {
  name: string
  email: string
  role: AuthRole
  password: string
  clientIds?: string[]
  propertyIds?: string[]
}): AuthUser {
  const salt = createId()
  return {
    id: createId(),
    name: input.name,
    email: input.email.toLowerCase(),
    role: input.role,
    clientIds: input.clientIds || [],
    propertyIds: input.propertyIds || [],
    passwordSalt: salt,
    passwordHash: hashPassword(input.password, salt),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
}

function createSeedState(): AuthState {
  return {
    users: [
      createSeedUser({
        name: 'SegurIA Admin',
        email: 'admin@seguria.local',
        role: 'admin',
        password: 'seguria-admin',
      }),
      createSeedUser({
        name: 'SegurIA Technician',
        email: 'tech@seguria.local',
        role: 'technician',
        password: 'seguria-tech',
        clientIds: ['demo-client'],
        propertyIds: ['demo-property'],
      }),
      createSeedUser({
        name: 'Demo Client',
        email: 'client@seguria.local',
        role: 'client',
        password: 'seguria-client',
        clientIds: ['demo-client'],
        propertyIds: ['demo-property'],
      }),
    ],
    sessions: [],
  }
}

async function readState(): Promise<AuthState> {
  await ensureStateFile()
  const raw = await fs.readFile(AUTH_FILE, 'utf8')
  return JSON.parse(raw) as AuthState
}

async function writeState(state: AuthState) {
  await fs.mkdir(path.dirname(AUTH_FILE), { recursive: true })
  await fs.writeFile(AUTH_FILE, JSON.stringify(state, null, 2), 'utf8')
}

export async function listAuthUsers() {
  const state = await readState()
  return state.users
}

export async function findAuthUserByEmail(email: string) {
  const state = await readState()
  return state.users.find((user) => user.email === email.toLowerCase())
}

export async function authenticateUser(email: string, password: string) {
  const user = await findAuthUserByEmail(email)
  if (!user) return null

  const expectedHash = hashPassword(password, user.passwordSalt)
  if (expectedHash !== user.passwordHash) return null

  const state = await readState()
  const token = createId()
  const session: AuthSession = {
    token,
    userId: user.id,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
    createdAt: nowIso(),
  }

  state.sessions = state.sessions.filter((entry) => entry.userId !== user.id)
  state.sessions.push(session)
  await writeState(state)

  return { user, session }
}

export async function getAuthSessionFromToken(token: string) {
  const state = await readState()
  const session = state.sessions.find((entry) => entry.token === token)
  if (!session) return null

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    state.sessions = state.sessions.filter((entry) => entry.token !== token)
    await writeState(state)
    return null
  }

  const user = state.users.find((entry) => entry.id === session.userId)
  return user ? { user, session } : null
}

export async function revokeAuthSession(token: string) {
  const state = await readState()
  state.sessions = state.sessions.filter((entry) => entry.token !== token)
  await writeState(state)
}

export function getAuthTokenFromRequest(request: NextRequest) {
  return request.cookies.get(SESSION_COOKIE)?.value || null
}

export function serializeSessionCookie(token: string) {
  const maxAge = Math.floor(SESSION_TTL_MS / 1000)
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
}

export function canAccessProperty(user: AuthUser, propertyId: string) {
  if (user.role === 'admin') return true
  return user.propertyIds.includes(propertyId)
}

export function canAccessClient(user: AuthUser, clientId: string) {
  if (user.role === 'admin') return true
  return user.clientIds.includes(clientId)
}
