import React from "react";

type HeaderWithActionProps = {
  leftActionBtn?: React.ReactNode;
  rightActionBtn?: React.ReactNode;
  title: string;
};

export default function HeaderWithAction({
  leftActionBtn,
  rightActionBtn,
  title,
}: HeaderWithActionProps) {
  return (
    <div className="flex items-center">
      {leftActionBtn || <></>}
      <p className="w-full text-center font-medium">{title}</p>

      {rightActionBtn || (
        // render invisible button so we can have the middle p tag centered.
        <span className="invisible">{leftActionBtn}</span>
      )}
    </div>
  );
}
