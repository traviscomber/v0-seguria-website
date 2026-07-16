import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { createClient, type User } from '@supabase/supabase-js'
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

function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
}

function createSupabaseAuthClient() {
  if (!hasSupabaseConfig()) {
    return null
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )
}

function nowIso() {
  return new Date().toISOString()
}

function createId() {
  return crypto.randomBytes(16).toString('hex')
}

function hashPassword(password: string, salt: string) {
  return crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex')
}

function createPasswordRecord(password: string) {
  const salt = createId()
  return {
    passwordSalt: salt,
    passwordHash: hashPassword(password, salt),
  }
}

function getRoleFromEmail(email: string): AuthRole {
  const normalized = email.toLowerCase()
  if (normalized === 'admin@seguria.local') return 'admin'
  if (normalized === 'tech@seguria.local') return 'technician'
  return 'client'
}

function getPortalScopeForEmail(email: string) {
  const normalized = email.toLowerCase()
  if (normalized === 'juan@n3uralia.com') {
    return { clientIds: ['n3uralia'], propertyIds: ['n3uralia'] }
  }
  if (normalized === 'client@seguria.local') {
    return { clientIds: ['demo-client'], propertyIds: ['demo-property'] }
  }
  if (normalized === 'tech@seguria.local') {
    return { clientIds: ['demo-client'], propertyIds: ['demo-property'] }
  }
  return { clientIds: [], propertyIds: [] }
}

export function mapSupabaseUserToAuthUser(user: User): AuthUser {
  const email = user.email?.toLowerCase() || ''
  const role = (user.app_metadata?.role as AuthRole | undefined) || (user.user_metadata?.role as AuthRole | undefined) || getRoleFromEmail(email)
  const scope = getPortalScopeForEmail(email)

  return {
    id: user.id,
    name: (user.user_metadata?.full_name as string | undefined) || (user.user_metadata?.name as string | undefined) || user.email?.split('@')[0] || 'Usuario',
    email: email || 'usuario@seguria.local',
    role,
    clientIds: scope.clientIds,
    propertyIds: scope.propertyIds,
    passwordSalt: '',
    passwordHash: '',
    createdAt: user.created_at,
    updatedAt: user.updated_at || user.created_at,
  }
}

function isAuthState(value: unknown): value is AuthState {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<AuthState>
  return Array.isArray(candidate.users) && Array.isArray(candidate.sessions)
}

async function repairCorruptState(raw: string) {
  await fs.mkdir(path.dirname(AUTH_FILE), { recursive: true })
  const backupName = `auth-state.corrupt-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  const backupPath = path.join(path.dirname(AUTH_FILE), backupName)

  try {
    await fs.writeFile(backupPath, raw, 'utf8')
  } catch {
    // Best effort backup only.
  }

  const seed = createSeedState()
  await writeState(seed)
  return seed
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

function createUserRecord(input: {
  id?: string
  name: string
  email: string
  role: AuthRole
  password: string
  clientIds?: string[]
  propertyIds?: string[]
}): AuthUser {
  return {
    id: input.id || createId(),
    name: input.name,
    email: input.email.toLowerCase(),
    role: input.role,
    clientIds: input.clientIds || [],
    propertyIds: input.propertyIds || [],
    ...createPasswordRecord(input.password),
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
      createSeedUser({
        name: 'N3uralia',
        email: 'juan@n3uralia.com',
        role: 'client',
        password: 'c4rlit0s',
        clientIds: ['n3uralia'],
        propertyIds: ['n3uralia'],
      }),
    ],
    sessions: [],
  }
}

function getDefaultRoleForEmail(email: string): AuthRole {
  const normalized = email.toLowerCase()
  if (normalized === 'admin@seguria.local') return 'admin'
  if (normalized === 'tech@seguria.local') return 'technician'
  return 'client'
}

function getDisplayNameFromEmail(email: string) {
  const localPart = email.split('@')[0] || 'Usuario'
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

async function readState(): Promise<AuthState> {
  await ensureStateFile()
  const raw = await fs.readFile(AUTH_FILE, 'utf8')

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!isAuthState(parsed)) {
      return repairCorruptState(raw)
    }
    return parsed
  } catch {
    return repairCorruptState(raw)
  }
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

export async function upsertAuthUser(input: {
  name: string
  email: string
  role: AuthRole
  password: string
  clientIds?: string[]
  propertyIds?: string[]
}) {
  const state = await readState()
  const email = input.email.toLowerCase()
  const existingIndex = state.users.findIndex((user) => user.email === email)
  const passwordRecord = createPasswordRecord(input.password)
  const nextUser = existingIndex >= 0
    ? {
        ...state.users[existingIndex],
        name: input.name,
        role: input.role,
        clientIds: input.clientIds || [],
        propertyIds: input.propertyIds || [],
        ...passwordRecord,
        updatedAt: nowIso(),
      }
    : createUserRecord(input)

  if (existingIndex >= 0) {
    state.users[existingIndex] = nextUser
  } else {
    state.users.push(nextUser)
  }

  await writeState(state)
  return nextUser
}

export async function ensureAuthUserForEmail(input: {
  email: string
  name?: string
  role?: AuthRole
}) {
  const existing = await findAuthUserByEmail(input.email)
  if (existing) {
    return existing
  }

  return upsertAuthUser({
    name: input.name || getDisplayNameFromEmail(input.email),
    email: input.email,
    role: input.role || getDefaultRoleForEmail(input.email),
    password: createId(),
    clientIds: input.role === 'admin' ? [] : [input.email.toLowerCase()],
    propertyIds: input.role === 'admin' ? [] : [input.email.toLowerCase()],
  })
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

export async function createAuthSessionForUser(user: AuthUser) {
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
  const supabase = createSupabaseAuthClient()
  if (!supabase) {
    return null
  }

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) {
    return null
  }

  const user = mapSupabaseUserToAuthUser(data.user)
  return {
    user,
    session: {
      token,
      userId: user.id,
      expiresAt: data.user.last_sign_in_at || data.user.updated_at || nowIso(),
      createdAt: data.user.created_at || nowIso(),
    },
  }
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
