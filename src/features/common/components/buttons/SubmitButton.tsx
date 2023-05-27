import { cn } from "@/utils/cn";
import { ButtonHTMLAttributes, FC } from "react";
export const SubmitButton: FC<ButtonHTMLAttributes<HTMLButtonElement>> = (
  props
) => {
  const { disabled, className, ...restProps } = props;
  return (
    <button
      className={cn(
        "text-white py-2 rounded shadow-xl",
        disabled
          ? " bg-gray-300 hover:bg-gray-300/90 "
          : " bg-theme-color hover:bg-theme-color/90 ",
        className
      )}
      disabled={disabled}
      {...restProps}
    />
  );
};
