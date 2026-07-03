import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/student", "/admin", "/super-admin"];
// Routes that are only for unauthenticated users
const authRoutes = ["/login", "/register", "/forgot-password"];
// Role-based route prefixes
const roleRoutes: Record<string, string[]> = {
  super_admin: ["/super-admin", "/admin", "/student"],
  admin: ["/admin", "/student"],
  teacher: ["/admin/questions", "/admin/exams", "/student"],
  content_manager: ["/admin/questions", "/admin/exams", "/student"],
  student: ["/student"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("examnexa_session");
  const isAuthenticated = !!sessionCookie?.value;

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && authRoutes.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/student/dashboard", request.url));
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated && protectedRoutes.some((r) => pathname.startsWith(r))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icons|images|og).*)",
  ],
};
