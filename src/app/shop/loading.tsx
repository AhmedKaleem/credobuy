import { Container, Skeleton } from "@/components/ui/primitives";
import { ProductGridSkeleton } from "@/components/product/ProductGrid";

export default function ShopLoading() {
  return (
    <Container className="py-6">
      <Skeleton className="mb-6 h-8 w-48" />
      <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
        <Skeleton className="hidden h-[600px] lg:block" />
        <div>
          <Skeleton className="mb-4 h-6 w-32" />
          <ProductGridSkeleton />
        </div>
      </div>
    </Container>
  );
}
