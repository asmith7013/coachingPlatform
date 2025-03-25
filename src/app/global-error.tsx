"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
    useEffect(() => {
        Sentry.captureException(error); // ✅ Send UI errors to Sentry
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-xl font-bold">Something went wrong</h1>
            <p className="text-gray-600">{error.message || "Unexpected error occurred."}</p>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => reset()}>
                Try Again
            </button>
        </div>
    );
}


// "use client";

// import * as Sentry from "@sentry/nextjs";
// import NextError from "next/error";
// import { useEffect } from "react";

// export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
//   useEffect(() => {
//     Sentry.captureException(error);
//   }, [error]);

//   return (
//     <html>
//       <body>
//         {/* `NextError` is the default Next.js error page component. Its type
//         definition requires a `statusCode` prop. However, since the App Router
//         does not expose status codes for errors, we simply pass 0 to render a
//         generic error message. */}
//         <NextError statusCode={0} />
//       </body>
//     </html>
//   );
// }