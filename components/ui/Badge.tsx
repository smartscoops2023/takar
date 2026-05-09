import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeColor = "orange" | "green" | "blue" | "purple" | "stone" | "red";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
}

const colorMap: Record<BadgeColor, string> = {
  orange: "bg-orange-100 text-orange-700",
  green:  "bg-green-100 text-green-700",
  blue:   "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
  stone:  "bg-stone-100 text-stone-600",
  red:    "bg-red-100 text-red-700",
};

// Warna per kategori bahan
export const kategoriBahanColor: Record<string, BadgeColor> = {
  Kering:  "orange",
  Basah:   "blue",
  Kemasan: "purple",
  Bumbu:   "green",
};

// Warna per kategori resep
export const kategoriResepColor: Record<string, BadgeColor> = {
  Kue:      "orange",
  Roti:     "orange",
  Minuman:  "blue",
  Makanan:  "green",
  Snack:    "purple",
  Lainnya:  "stone",
};

export function Badge({ color = "stone", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        colorMap[color],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
