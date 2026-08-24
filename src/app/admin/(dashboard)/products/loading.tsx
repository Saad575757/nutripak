import { TableSkeleton } from "@/components/shared/table-skeleton";

export default function ProductsLoading() {
  return (
    <div className="bg-card rounded-xl border">
      <TableSkeleton columns={8} rows={10} />
    </div>
  );
}
