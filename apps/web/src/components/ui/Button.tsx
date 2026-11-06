import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "icon"
    | "destructive"
    | "follow"
    | "following"
    | "connection"
    | "action";
  size?: "xs" | "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      icon,
      leftIcon = icon,
      rightIcon,
      className = "",
      ...props
    },
    ref
  ) => {
    // Size styles
    const sizeClasses = {
      xs: "px-2 py-1 text-[11px] rounded-lg gap-1.5",
      sm: "px-3 py-1.5 text-xs rounded-xl gap-2",
      md: "px-4 py-2 text-xs font-semibold rounded-xl gap-2",
      lg: "px-5 py-2.5 text-sm font-semibold rounded-2xl gap-2.5",
    };

    // Variant styles
    const variantClasses = {
      primary:
        "bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white shadow-md shadow-violet-900/20 border border-violet-500/30",
      secondary:
        "bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-slate-200 border border-slate-700/60",
      outline:
        "bg-transparent hover:bg-slate-800/80 active:bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600",
      ghost:
        "bg-transparent hover:bg-slate-800/60 active:bg-slate-800 text-slate-400 hover:text-slate-100 border border-transparent",
      icon:
        "p-2 bg-transparent hover:bg-slate-800/80 active:bg-slate-800 text-slate-400 hover:text-slate-100 rounded-xl",
      destructive:
        "bg-rose-950/40 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 active:bg-rose-700",
      follow:
        "bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-sm border border-violet-500/30",
      following:
        "bg-slate-800/90 hover:bg-rose-950/40 hover:border-rose-500/40 hover:text-rose-400 text-slate-300 border border-slate-700/80 font-medium",
      connection:
        "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium",
      action:
        "text-slate-400 hover:text-violet-400 hover:bg-slate-800/60 transition-colors rounded-lg",
    };

    const baseClasses =
      "inline-flex items-center justify-center font-medium transition-all duration-150 select-none focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:ring-offset-1 focus:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${variant === "icon" ? variantClasses.icon : `${sizeClasses[size]} ${variantClasses[variant]}`} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
