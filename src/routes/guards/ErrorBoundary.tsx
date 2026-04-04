import type { ReactNode } from "react";
import {
  ErrorBoundary as ReactErrorBoundary,
  type FallbackProps,
} from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const errorMessage =
    error instanceof Error
      ? error.message
      : "An unexpected error has occurred.";

  return (
    <section className="bg-white h-screen flex items-center justify-center">
      <div className="py-8 px-4 mx-auto max-w-xl lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-sm text-center">
          <h1 className="mb-4 text-3xl tracking-tight font-extrabold text-primary-600 ">
            Something went wrong
          </h1>
          <p className="mb-4 text-lg font-light text-gray-500 ">
            {errorMessage}
          </p>

          <button
            onClick={() => resetErrorBoundary()}
            className="bg-gray-700 text-white px-4 py-2 rounded"
          >
            Try again
          </button>
        </div>
      </div>
    </section>
  );
}

export default function ErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        console.error("Route error:", error, info);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
