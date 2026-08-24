import { CardsSkeleton } from "@/components/shared/table-skeleton";
import { TableSkeleton } from "@/components/shared/table-skeleton";

export default function DashboardLoading() {
  return (
    <>
      <CardsSkeleton count={8} />
      <div className="bg-card mt-8 rounded-xl border">
        <div className="border-b p-4">
          <div className="h-5 w-40" />
        </div>
        <TableSkeleton columns={7} rows={8} />
      </div>
    </>
  );
}
