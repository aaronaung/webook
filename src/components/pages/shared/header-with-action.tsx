import { cn } from "@/src/utils";
import React from "react";

type HeaderWithActionProps = {
  leftActionBtn?: React.ReactNode;
  rightActionBtn?: React.ReactNode;
  title: string;
  className?: string;
};

export default function HeaderWithAction({
  leftActionBtn,
  rightActionBtn,
  title,
  className,
}: HeaderWithActionProps) {
  return (
    <div className={cn("flex items-center px-4", className)}>
      {leftActionBtn || <></>}
      <p className="w-full text-center font-medium">{title}</p>

      {rightActionBtn || (
        // render invisible button so we can have the middle p tag centered.
        <span className="invisible">{leftActionBtn}</span>
      )}
    </div>
  );
}
