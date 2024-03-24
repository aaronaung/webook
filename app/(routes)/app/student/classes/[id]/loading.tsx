import { Spinner } from "@/src/components/common/loading-spinner";

export default function Loading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Spinner size="large" />
    </div>
  );
}
