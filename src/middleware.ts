import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define only your public routes
const isPublicRoute = createRouteMatcher([
  '/',               // Landing page
  '/sign-in(.*)',    // Sign in flow
  '/sign-up(.*)',    // Sign up flow
  '/terms',          // Legal pages
  '/privacy',
  '/api/webhook/clerk', // Clerk webhooks
])

export default clerkMiddleware(async (auth, request) => {
  // Protect everything except public routes
  if (!isPublicRoute(request)) {
    await auth.protect() // Note: auth.protect() not auth().protect()
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