import { Control, RegisterOptions, UseFormRegister } from "react-hook-form";

export type CommonRhfInputProps = {
  className?: string;
  description?: string;
  disabled?: boolean;
  disableValidation?: boolean;
  error?: string;
  label?: string;
  rhfKey?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  onChange?: (e) => void; // This is used for when you want to do extra things on top of RHF.
};

export type ControlledRhfInputProps = CommonRhfInputProps & {
  control: Control<any>;
};
export type RhfInputProps = CommonRhfInputProps & {
  register?: UseFormRegister<any>;
  registerOptions?: RegisterOptions;
};
