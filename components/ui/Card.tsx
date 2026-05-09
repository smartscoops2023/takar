import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "sm" | "md" | "lg" | "none";
}

export function Card({ className, padding = "md", children, ...props }: CardProps) {
  const padMap = {
    none: "",
    sm:   "p-3",
    md:   "p-4",
    lg:   "p-5",
  };
  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-sm border border-[#e8e4df]",
        padMap[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
