"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p>We could not complete that action. Please try again.</p>
      <p className="text-sm text-slate-600">{error.message}</p>
      <button className="bg-primary text-white" onClick={reset}>Try again</button>
    </div>
  );
}
