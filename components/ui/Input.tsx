import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, prefix, suffix, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-stone-700">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-sm text-stone-400 pointer-events-none select-none">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-11 rounded-xl border border-[#e8e4df] bg-white px-3 text-sm text-stone-800",
              "placeholder:text-stone-300",
              "focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent",
              "transition-shadow duration-150",
              "disabled:bg-stone-50 disabled:text-stone-400",
              error && "border-red-400 focus:ring-red-400",
              prefix && "pl-8",
              suffix && "pr-12",
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 text-sm text-stone-400 pointer-events-none select-none">
              {suffix}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-stone-400">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
