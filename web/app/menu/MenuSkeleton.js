export default function MenuSkeleton() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse px-4 pt-5" aria-busy="true" aria-label="در حال بارگذاری منو">
      <div className="flex items-center gap-3">
        <div className="size-11 rounded-2xl bg-line" />
        <div className="h-5 w-32 rounded-full bg-line" />
      </div>
      <div className="mt-4 h-11 rounded-2xl bg-line" />
      <div className="mt-3 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-9 w-24 shrink-0 rounded-full bg-line" />
        ))}
      </div>
      <div className="mt-8 grid gap-3 md:grid-cols-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-3 rounded-3xl bg-paper p-3">
            <div className="size-24 shrink-0 rounded-2xl bg-line" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-4 w-2/3 rounded-full bg-line" />
              <div className="h-3 w-full rounded-full bg-line" />
              <div className="h-4 w-1/3 rounded-full bg-line" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
