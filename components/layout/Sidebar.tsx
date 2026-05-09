"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, BookOpen, Settings, ChefHat } from "lucide-react";

const navItems = [
  { href: "/",           label: "Beranda",    icon: Home,     desc: "Ringkasan & statistik" },
  { href: "/bahan",      label: "Bahan Baku", icon: Package,  desc: "Kelola inventori bahan" },
  { href: "/resep",      label: "Resep",      icon: BookOpen, desc: "Resep & kalkulator HPP" },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings, desc: "Konfigurasi aplikasi" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-[#e8e4df] fixed left-0 top-0 bottom-0 z-40">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[#e8e4df]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm shadow-orange-200 flex-shrink-0">
          <ChefHat size={18} className="text-white" />
        </div>
        <div>
          <p className="text-base font-bold text-stone-800 leading-tight">Takar</p>
          <p className="text-xs text-stone-400 leading-tight">Kalkulator HPP</p>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider px-3 mb-3">
          Menu
        </p>
        {navItems.map(({ href, label, icon: Icon, desc }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group
                ${isActive
                  ? "bg-orange-50 text-orange-600"
                  : "text-stone-600 hover:bg-stone-50 hover:text-stone-800"
                }
              `}
            >
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                ${isActive
                  ? "bg-orange-100"
                  : "bg-stone-100 group-hover:bg-stone-200"
                }
              `}>
                <Icon
                  size={16}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={isActive ? "text-orange-500" : "text-stone-500"}
                />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-medium leading-tight ${isActive ? "text-orange-700" : ""}`}>
                  {label}
                </p>
                <p className="text-xs text-stone-400 leading-tight truncate">{desc}</p>
              </div>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer sidebar */}
      <div className="px-5 py-4 border-t border-[#e8e4df]">
        <p className="text-xs text-stone-400 text-center">Takar v0.1.0 · MVP</p>
      </div>
    </aside>
  );
}
