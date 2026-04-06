import { cookies } from 'next/headers'
import { createHmac } from 'crypto'

const SESSION_COOKIE = 'session'
const SESSION_VALUE = 'authenticated'

function sign(value: string): string {
  const secret = process.env.COOKIE_SECRET ?? 'fallback-secret-change-me'
  const hmac = createHmac('sha256', secret)
  hmac.update(value)
  return `${value}.${hmac.digest('hex')}`
}

function verify(signed: string): boolean {
  const secret = process.env.COOKIE_SECRET ?? 'fallback-secret-change-me'
  const lastDot = signed.lastIndexOf('.')
  if (lastDot === -1) return false
  const value = signed.substring(0, lastDot)
  const hmac = createHmac('sha256', secret)
  hmac.update(value)
  const expected = `${value}.${hmac.digest('hex')}`
  return signed === expected && value === SESSION_VALUE
}

export async function getSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(SESSION_COOKIE)
  if (!cookie) return false
  return verify(cookie.value)
}

export function createSessionValue(): string {
  return sign(SESSION_VALUE)
}

export function checkPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) return false
  return password === adminPassword
}
