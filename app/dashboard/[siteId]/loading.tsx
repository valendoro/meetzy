export default function SiteDashboardLoading() {
  return (
    <div className="space-y-8 py-1">
      <div className="space-y-3">
        <div className="dash-skeleton h-9 w-48 max-w-[70%]" />
        <div className="dash-skeleton h-4 w-72 max-w-[85%]" />
      </div>
      <div className="dash-skeleton h-28 w-full max-w-3xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="dash-skeleton h-32" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="dash-skeleton h-64 w-full" />
        <div className="dash-skeleton h-64 w-full" />
      </div>
    </div>
  );
}
