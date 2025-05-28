import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',                      // Landing page
  '/sign-in(.*)',           // Sign in flow
  '/sign-up(.*)',           // Sign up flow
  '/setup',                 // Setup page for new users
  '/terms',                 // Legal pages
  '/privacy',
  '/api/webhooks/clerk',    // Clerk webhooks (fixed path)
  '/examples/cap(.*)',      // ✅ All CAP examples (current and future)
])

export default clerkMiddleware(async (auth, request) => {
  // Protect everything except public routes
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}