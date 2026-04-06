import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_COOKIE = 'session'
const SESSION_VALUE = 'authenticated'

async function verify(signed: string, secret: string): Promise<boolean> {
  const lastDot = signed.lastIndexOf('.')
  if (lastDot === -1) return false

  const value = signed.substring(0, lastDot)
  const signature = signed.substring(lastDot + 1)

  if (value !== SESSION_VALUE) return false

  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  )

  const sigBytes = Uint8Array.from(
    signature.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  )

  return crypto.subtle.verify('HMAC', keyMaterial, sigBytes, enc.encode(value))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLoginPage = pathname === '/login'
  const isApiAuth = pathname.startsWith('/api/auth')

  if (isApiAuth) return NextResponse.next()

  const sessionCookie = request.cookies.get(SESSION_COOKIE)
  const secret = process.env.COOKIE_SECRET ?? 'fallback-secret-change-me'
  const isAuthenticated = sessionCookie
    ? await verify(sessionCookie.value, secret)
    : false

  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
