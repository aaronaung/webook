"use client";
import { PlusIcon } from "@heroicons/react/24/solid";
import { Button } from "@/src/components/ui/button";

type EmptyStateProps = {
  onAction: () => void;
  actionButtonText: string;
  title: string;
  description?: string;
  Icon: React.ComponentType<{ className?: string }>;
};

export default function EmptyState({
  onAction,
  actionButtonText,
  title,
  description,
  Icon,
}: EmptyStateProps) {
  return (
    <div className="text-center">
      <Icon className="mx-auto h-12 w-12" aria-hidden="true" />
      <h3 className="mt-2 text-sm font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
      <div className="mt-6">
        <Button type="button" onClick={onAction}>
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          {actionButtonText}
        </Button>
      </div>
    </div>
  );
}
