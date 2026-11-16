"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-w grid min-h-[50vh] place-items-center text-center">
      <div>
        <div className="text-5xl">⚠</div>
        <h1 className="mt-4 text-xl font-bold text-white">حدث خطأ · Something went wrong</h1>
        <button onClick={reset} className="btn-gold mt-6">
          إعادة المحاولة · Retry
        </button>
      </div>
    </div>
  );
}
