import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { ACCESS_TOKEN_COOKIE, USER_ROLE_COOKIE } from "@/services/token-storage"
import { TRole } from "@/services/auth/types"

const CLIENT_DASHBOARD = "/client/dashboard"
const WORKER_DASHBOARD = "/worker/dashboard"
const LOGIN = "/login"

function getDashboardByRole(role: string | undefined): string {
  if (role === TRole.WORKER) return WORKER_DASHBOARD
  return CLIENT_DASHBOARD
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  const role = request.cookies.get(USER_ROLE_COOKIE)?.value
  const { pathname } = request.nextUrl

  const isAuthPage = pathname === LOGIN || pathname === "/register"
  const isClientArea = pathname.startsWith("/client")
  const isWorkerArea = pathname.startsWith("/worker")
  const isProtected = isClientArea || isWorkerArea

  // Protected routes: require auth
  if (isProtected && !token) {
    const url = request.nextUrl.clone()
    url.pathname = LOGIN
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }

  // Role-based access: client area only for Client, worker area only for Worker
  if (token && isProtected) {
    if (isClientArea && role !== TRole.CLIENT) {
      return NextResponse.redirect(new URL(WORKER_DASHBOARD, request.url))
    }
    if (isWorkerArea && role !== TRole.WORKER) {
      return NextResponse.redirect(new URL(CLIENT_DASHBOARD, request.url))
    }
  }

  // Logged-in users visiting login/register -> redirect to their dashboard
  if (token && isAuthPage) {
    const dashboard = getDashboardByRole(role)
    return NextResponse.redirect(new URL(dashboard, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/client/:path*", "/worker/:path*", "/login", "/register"],
}
