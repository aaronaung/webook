"use client";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import CreateBusinessForm from "./create-business-form";
import { Button } from "@/components/ui/button";

export default function EmptyState() {
  const [isCreating, setIsCreating] = useState(false);

  if (isCreating) {
    return <CreateBusinessForm onBack={() => setIsCreating(false)} />;
  }

  return (
    <div className="text-center">
      <BuildingOffice2Icon className="mx-auto h-12 w-12" aria-hidden="true" />
      <h3 className="mt-2 text-sm font-semibold text-gray-900">
        No businesses
      </h3>
      <p className="mt-1 text-sm text-gray-500">Get started by creating one.</p>
      <div className="mt-6">
        <Button type="button" onClick={() => setIsCreating(true)}>
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          New Business
        </Button>
      </div>
    </div>
  );
}