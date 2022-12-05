import { FC, InputHTMLAttributes } from "react";
import { useFormContext } from "react-hook-form";

type FormTextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  type?: string;
  name: string;
  label?: string;
  className?: string;
  onChange?: () => void;
};
type FormErrorType = { message: string; type: string; ref: undefined | string };
export const FormTextInput: FC<FormTextInputProps> = ({
  type = "text",
  name,
  label,
  className = "",
  onChange,
  ...inputProps
}) => {
  const {
    formState: { errors },
    setValue,
  } = useFormContext();
  const error = errors[name] as FormErrorType | undefined;
  return (
    <div className="flex flex-col space-y-1 w-full">
      {label && (
        <label htmlFor={name} className="text-gray-700">
          {label}:
        </label>
      )}
      <input
        id={name}
        {...inputProps}
        name={name}
        type={type}
        className={`outline-none border-2 rounded p-1 ${className}`}
        onChange={
          onChange
            ? onChange
            : (event) => {
                const { value } = event.target;
                setValue(name, value);
              }
        }
      />
      {error && <p className="text-red-500 text-sm">{error.message}</p>}
    </div>
  );
};
