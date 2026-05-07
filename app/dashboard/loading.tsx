export default function DashboardLoading() {
  return (
    <div className="dash-page-enter space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <div className="product-skeleton h-10 w-48 rounded-lg" />
          <div className="product-skeleton h-4 w-72 rounded" />
        </div>
        <div className="product-skeleton h-11 w-40 rounded-[10px]" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="product-skeleton h-64 rounded-2xl" />
        <div className="product-skeleton h-64 rounded-2xl" />
      </div>
    </div>
  );
}
