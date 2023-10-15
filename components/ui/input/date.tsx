import { Controller, ControllerRenderProps } from "react-hook-form";
import InputDecorator from "./decorator";
import { ControlledRhfInputProps } from ".";
import { Button } from "../button";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "../calendar";

type InputDatePickerProps = ControlledRhfInputProps;

export default function InputDatePicker(props: InputDatePickerProps) {
  const input = ({ field }: { field: ControllerRenderProps }) => (
    <InputDecorator {...props}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !field.value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {field.value ? (
              format(field.value, "PPP")
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={field.value}
            onSelect={(newDate) => {
              field.onChange(newDate);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </InputDecorator>
  );

  return (
    <Controller
      name={props.rhfKey}
      control={props.control}
      rules={props.disableValidation ? { validate: () => true } : undefined}
      render={({ field }) => input({ field })}
    />
  );
}
