import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/", // Landing page
  "/sign-in(.*)", // Sign in flow
  "/sign-up(.*)", // Sign up flow
  "/sign-out(.*)", // Sign out flow
  "/sso-callback(.*)", // OAuth callback handler
  "/setup", // Setup page for new users
  "/terms", // Legal pages
  "/privacy",
  "/api/webhooks/clerk", // Clerk webhooks (fixed path)
  "/api/roadmaps/scrape", // Scraper API (has own API key auth)
  "/api/timesheet", // Timesheet API (has own API key auth)
  "/api/podsie/(.*)", // Podsie API (has own API key auth)
  "/api/scm/(.*)", // SCM API (has own API key auth)
  "/scm/workedExamples/viewer(.*)", // Worked examples viewer (public)
  "/scm/content/state-exam(.*)", // State exam questions (public)
  "/skillsHub/sign-in(.*)", // SkillsHub sign-in (magic link)
]);

export default clerkMiddleware(async (auth, request) => {
  // Protect everything except public routes
  if (!isPublicRoute(request)) {
    if (request.nextUrl.pathname.startsWith("/skillsHub")) {
      await auth.protect({
        unauthenticatedUrl: new URL(
          "/skillsHub/sign-in",
          request.url,
        ).toString(),
      });
    } else {
      await auth.protect();
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
