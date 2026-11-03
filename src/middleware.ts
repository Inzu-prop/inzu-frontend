import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import {
  isLocalPreviewEnabled,
  isLoopbackHost,
  isLoopbackAuthority,
  isPreviewPath,
} from "@/lib/local-preview.mjs";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

const authenticatedMiddleware = clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  if (isPreviewPath(req.nextUrl.pathname)) {
    if (isLocalPreviewEnabled() && isLoopbackHost(req.nextUrl.hostname) && isLoopbackAuthority(req.headers.get("host")))
      return NextResponse.next();
    return new NextResponse("Not found", { status: 404 });
  }
  return authenticatedMiddleware(req, event);
}

export const config = {
  matcher: [
    "/preview/:path*",
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
