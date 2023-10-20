import { cn } from "@/src/utils";
import { CommonRhfInputProps } from ".";
import { Label } from "../label";

export default function InputDecorator({
  label,
  description,
  error,
  rhfKey,
  ...props
}: React.PropsWithChildren<CommonRhfInputProps>) {
  return (
    <>
      {label && <Label htmlFor={rhfKey}>{label}</Label>}
      <div
        className={cn(
          error && "rounded-md ring-1 ring-destructive ring-offset-background",
        )}
      >
        {props.children}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {error && <p className="my-2 text-sm text-destructive">{error}</p>}
    </>
  );
}
