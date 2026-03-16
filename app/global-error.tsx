"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
          <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
          <p className="mt-2 text-center text-gray-600">
            A critical error occurred. Please try refreshing the page.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-8 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
