export default function Loading() {
  return (
    <div className="container-x py-10 md:py-16" aria-busy="true" aria-label="Loading designs">
      <div className="skeleton h-4 w-32" />
      <div className="skeleton mt-4 h-12 w-2/3" />
      <div className="skeleton mt-8 h-12" />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="card overflow-hidden">
            <div className="skeleton aspect-[4/5] rounded-none" />
            <div className="space-y-2 p-4">
              <div className="skeleton h-5 w-2/3" />
              <div className="skeleton h-4 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
