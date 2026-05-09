"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, BookOpen, Settings } from "lucide-react";

const navItems = [
  { href: "/",          label: "Beranda",    icon: Home },
  { href: "/bahan",     label: "Bahan",      icon: Package },
  { href: "/resep",     label: "Resep",      icon: BookOpen },
  { href: "/pengaturan",label: "Pengaturan", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e8e4df] pb-safe">
      <div className="max-w-lg mx-auto flex items-stretch">
        {navItems.map(({ href, label, icon: Icon }) => {
          // aktif jika path sama persis (beranda) atau dimulai dengan href (sub-halaman)
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`
                flex flex-col items-center justify-center gap-0.5 flex-1 py-2.5 text-xs font-medium
                transition-colors duration-150 select-none
                ${isActive
                  ? "text-orange-500"
                  : "text-stone-400 hover:text-stone-600 active:text-orange-400"
                }
              `}
            >
              <span className="relative">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className="transition-all duration-150"
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-500" />
                )}
              </span>
              <span className={isActive ? "text-orange-500" : ""}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
