export default function Loading() {
  return (
    <div className="container-w py-10">
      <div className="skeleton h-12 w-full max-w-xl" />
      <div className="skeleton mt-6 h-56 w-full" />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton aspect-[3/4]" />
        ))}
      </div>
    </div>
  );
}
