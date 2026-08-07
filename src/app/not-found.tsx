import Link from "next/link";
import { Container } from "@/components/ui/primitives";
import { buttonStyles } from "@/components/ui/Button";
import { PackageX } from "lucide-react";

export default function NotFound() {
  return (
    <Container className="py-20">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
          <PackageX size={30} />
        </span>
        <h1 className="mt-5 text-3xl font-bold">Page not found</h1>
        <p className="mt-2 text-sm text-muted">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <Link href="/" className={`${buttonStyles("primary")} mt-6`}>
          Back to home
        </Link>
      </div>
    </Container>
  );
}
