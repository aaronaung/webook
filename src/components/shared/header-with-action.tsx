"use client";
import { cn } from "@/src/utils";
import React from "react";
import { Button } from "../ui/button";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

type HeaderWithActionProps = {
  hideBackBtn?: boolean;
  leftActionBtn?: React.ReactNode;
  rightActionBtn?: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
};

export default function HeaderWithAction({
  hideBackBtn,
  leftActionBtn,
  rightActionBtn,
  title,
  subtitle,
  className,
}: HeaderWithActionProps) {
  const router = useRouter();

  const leftButton =
    leftActionBtn ||
    (!hideBackBtn && (
      <Button onClick={() => router.back()} variant="ghost">
        <ArrowLeftIcon className="h-5 w-5" />
      </Button>
    ));

  return (
    <div className={cn("flex items-center py-2", className)}>
      {leftButton}
      <div className="w-full text-center">
        {title && <p className="font-medium">{title}</p>}
        {subtitle && (
          <p className="text-xs text-muted-foreground ">{subtitle}</p>
        )}
      </div>
      {rightActionBtn || (
        // render invisible button so we can have the middle p tag centered.
        <span className="invisible">{leftButton}</span>
      )}
    </div>
  );
}
