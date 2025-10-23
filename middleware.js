import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export const middleware = withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Redirect to login if accessing protected routes without authentication
    if (!token && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }

    if (!token && pathname.startsWith("/study")) {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }

    if (!token && pathname.startsWith("/quizzes")) {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }

    if (!token && pathname.startsWith("/flashcards")) {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }

    if (!token && pathname.startsWith("/notes")) {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }

    if (!token && pathname.startsWith("/chat")) {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }

    if (!token && pathname.startsWith("/roadmap")) {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }

    if (!token && pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }

    // Redirect authenticated users away from auth pages
    if (token && (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup"))) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token || true,
    },
  },
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/study/:path*",
    "/quizzes/:path*",
    "/flashcards/:path*",
    "/notes/:path*",
    "/chat/:path*",
    "/roadmap/:path*",
    "/admin/:path*",
    "/auth/:path*",
  ],
}
