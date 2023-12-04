import { cn } from "@/src/utils";
import React from "react";

type HeaderWithActionProps = {
  leftActionBtn?: React.ReactNode;
  rightActionBtn?: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
};

export default function HeaderWithAction({
  leftActionBtn,
  rightActionBtn,
  title,
  subtitle,
  className,
}: HeaderWithActionProps) {
  return (
    <div className={cn("mb-2 flex items-center px-4 py-2", className)}>
      {leftActionBtn || <></>}
      <div className="w-full text-center">
        <p className="font-medium">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground ">{subtitle}</p>
        )}
      </div>
      {rightActionBtn || (
        // render invisible button so we can have the middle p tag centered.
        <span className="invisible">{leftActionBtn}</span>
      )}
    </div>
  );
}
