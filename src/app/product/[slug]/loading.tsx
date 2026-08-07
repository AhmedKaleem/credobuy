import { Container, Skeleton } from "@/components/ui/primitives";

export default function ProductLoading() {
  return (
    <Container className="py-6">
      <Skeleton className="mb-4 h-4 w-64" />
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-square" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </Container>
  );
}
