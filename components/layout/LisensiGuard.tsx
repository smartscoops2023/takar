"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getLisensi } from "@/lib/storage";

// Halaman yang tidak perlu lisensi
const PUBLIC_PATHS = ["/aktivasi", "/admin"];

interface Props {
  children: React.ReactNode;
}

export default function LisensiGuard({ children }: Props) {
  const router   = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Halaman publik — langsung tampilkan
    if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
      setChecked(true);
      return;
    }

    const lisensi = getLisensi();
    if (!lisensi) {
      router.replace("/aktivasi");
    } else {
      setChecked(true);
    }
  }, [pathname, router]);

  // Tampilkan loading singkat saat cek lisensi
  if (!checked) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
