import { Control, UseFormRegister } from "react-hook-form";

export type CommonRhfInputProps = {
  className?: string;
  description?: string;
  disabled?: boolean;
  disableValidation?: boolean;
  error?: string;
  label?: string;
  rhfKey: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
};

export type ControlledRhfInputProps = CommonRhfInputProps & {
  control: Control<any>;
};
export type RhfInputProps = CommonRhfInputProps & {
  register: UseFormRegister<any>;
};
