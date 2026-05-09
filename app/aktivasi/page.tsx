"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChefHat, Key, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { setLisensi, getLisensi } from "@/lib/storage";

export default function AktivasiPage() {
  const router = useRouter();
  const [kode, setKode]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Kalau sudah punya lisensi, redirect ke beranda
  useEffect(() => {
    if (getLisensi()) router.replace("/");
  }, [router]);

  // Format otomatis: TAKAR-XXXX-XXXX saat user mengetik
  function handleKodeChange(val: string) {
    // Ambil hanya huruf dan angka, uppercase
    const raw = val.toUpperCase().replace(/[^A-Z0-9]/g, "");

    // Batasi raw input: TAKAR(5) + XXXX(4) + XXXX(4) = 13 karakter raw
    const trimmed = raw.slice(0, 13);

    // Format jadi TAKAR-XXXX-XXXX
    let formatted = trimmed;
    if (trimmed.length > 9) {
      formatted = `${trimmed.slice(0, 5)}-${trimmed.slice(5, 9)}-${trimmed.slice(9)}`;
    } else if (trimmed.length > 5) {
      formatted = `${trimmed.slice(0, 5)}-${trimmed.slice(5)}`;
    }

    setKode(formatted);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!kode.trim()) { setError("Masukkan kode lisensi terlebih dahulu"); return; }

    setLoading(true);
    setError("");

    try {
      const res  = await fetch("/api/lisensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kode: kode.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setError(data.error ?? "Kode lisensi tidak valid");
        return;
      }

      // Simpan lisensi ke localStorage
      setLisensi(data.kode);
      setSuccess(true);

      // Redirect ke beranda setelah animasi
      setTimeout(() => router.replace("/"), 1500);
    } catch {
      setError("Gagal terhubung ke server. Periksa koneksi internet Anda.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 flex flex-col items-center justify-center p-4">

      {/* Card aktivasi */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl shadow-orange-900/20 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-6 pt-8 pb-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
            <ChefHat size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Takar</h1>
          <p className="text-orange-100 text-sm mt-1">Kalkulator HPP & Manajemen Resep</p>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {success ? (
            // Success state
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <p className="text-base font-bold text-stone-800">Aktivasi Berhasil!</p>
              <p className="text-sm text-stone-400 mt-1">Mengalihkan ke aplikasi...</p>
            </div>
          ) : (
            // Form aktivasi
            <form onSubmit={handleSubmit} noValidate>
              <div className="flex items-center gap-2 mb-4">
                <Key size={16} className="text-orange-500 flex-shrink-0" />
                <p className="text-sm font-semibold text-stone-700">Masukkan Kode Lisensi</p>
              </div>

              <p className="text-xs text-stone-400 mb-4 leading-relaxed">
                Masukkan kode lisensi yang Anda terima setelah pembelian.
                Format: <span className="font-mono font-semibold text-stone-600">TAKAR-XXXX-XXXX</span>
              </p>

              <input
                ref={inputRef}
                type="text"
                value={kode}
                onChange={(e) => handleKodeChange(e.target.value)}
                placeholder="TAKAR-XXXX-XXXX"
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                maxLength={15}
                className={`
                  w-full h-12 rounded-xl border-2 px-4 text-center text-base font-mono font-semibold
                  tracking-widest text-stone-800 placeholder:text-stone-300 placeholder:font-normal
                  placeholder:tracking-normal
                  focus:outline-none transition-colors
                  ${error
                    ? "border-red-400 bg-red-50 focus:border-red-400"
                    : "border-[#e8e4df] bg-stone-50 focus:border-orange-400 focus:bg-white"
                  }
                `}
              />

              {error && (
                <div className="flex items-center gap-2 mt-2">
                  <AlertCircle size={13} className="text-red-500 flex-shrink-0" />
                  <p className="text-xs text-red-500">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || kode.length < 5}
                className="mt-4 w-full h-12 rounded-xl bg-orange-500 text-white font-semibold text-sm
                  hover:bg-orange-600 active:scale-[0.98] transition-all
                  disabled:opacity-50 disabled:pointer-events-none
                  flex items-center justify-center gap-2 shadow-sm shadow-orange-200"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Memvalidasi...</>
                ) : (
                  "Aktifkan Sekarang"
                )}
              </button>

              <p className="text-xs text-stone-400 text-center mt-4 leading-relaxed">
                Belum punya kode lisensi?{" "}
                <a
                  href="https://wa.me/628xxxxxxxxxx?text=Halo,%20saya%20ingin%20membeli%20lisensi%20Takar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-500 font-medium hover:underline"
                >
                  Hubungi kami via WhatsApp
                </a>
              </p>
            </form>
          )}
        </div>
      </div>

      <p className="text-orange-200 text-xs mt-6">© 2024 Takar · v0.1.0</p>
    </div>
  );
}
