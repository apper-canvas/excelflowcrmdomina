import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Button = React.forwardRef(({ 
  className, 
  variant = "primary", 
  size = "md", 
  disabled = false,
  children, 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500",
    secondary: "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus:ring-primary-500",
    accent: "bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-500",
    ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-500"
  };
  
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  return (
    <button
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
{...props}
    >
      {children}
    </button>
  );
});
Button.displayName = "Button";

export default Button;