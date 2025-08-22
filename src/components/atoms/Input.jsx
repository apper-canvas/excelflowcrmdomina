import React from "react";
import { cn } from "@/utils/cn";

const Input = React.forwardRef(({ 
  className, 
  type = "text",
  placeholder,
  disabled = false,
  error = false,
  ...props 
}, ref) => {
  const baseStyles = "block w-full rounded-lg border bg-white px-3 py-2.5 text-sm placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50";
  
  const variants = {
    default: "border-gray-300 focus:border-primary-500 focus:ring-primary-500",
    error: "border-red-300 focus:border-red-500 focus:ring-red-500"
  };
  
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        baseStyles,
        error ? variants.error : variants.default,
        className
      )}
      placeholder={placeholder}
      disabled={disabled}
      {...props}
    />
  );
});

Input.displayName = "Input";

export default Input;