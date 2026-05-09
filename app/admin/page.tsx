"use client";

import { useState, useEffect, useCallback } from "react";
import { Key, Plus, RefreshCw, Copy, Check, ToggleLeft, ToggleRight, Lock } from "lucide-react";

interface Lisensi {
  kode: string;
  aktif: boolean;
  catatanAdmin: string | null;
  aktivasiPertama: string | null;
  jumlahAktivasi: number;
  createdAt: string;
}

export default function AdminPage() {
  const [password, setPassword]   = useState("");
  const [authed, setAuthed]       = useState(false);
  const [authError, setAuthError] = useState("");

  const [lisensiList, setLisensiList] = useState<Lisensi[]>([]);
  const [loading, setLoading]         = useState(false);
  const [generating, setGenerating]   = useState(false);
  const [jumlahBuat, setJumlahBuat]   = useState(1);
  const [catatan, setCatatan]         = useState("");
  const [copied, setCopied]           = useState<string | null>(null);

  const fetchLisensi = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/lisensi", {
        headers: { "x-admin-password": password },
      });
      const data = await res.json();
      if (res.ok) setLisensiList(data);
    } finally {
      setLoading(false);
    }
  }, [password]);

  useEffect(() => {
    if (authed) fetchLisensi();
  }, [authed, fetchLisensi]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/lisensi", {
      headers: { "x-admin-password": password },
    });
    if (res.ok) {
      setAuthed(true);
      setAuthError("");
    } else {
      setAuthError("Password salah");
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res  = await fetch("/api/admin/lisensi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ jumlah: jumlahBuat, catatan: catatan || null }),
      });
      if (res.ok) {
        setCatatan("");
        fetchLisensi();
      }
    } finally {
      setGenerating(false);
    }
  }

  async function toggleAktif(kode: string, aktif: boolean) {
    await fetch("/api/admin/lisensi", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify({ kode, aktif: !aktif }),
    });
    fetchLisensi();
  }

  function copyKode(kode: string) {
    navigator.clipboard.writeText(kode);
    setCopied(kode);
    setTimeout(() => setCopied(null), 2000);
  }

  function copyAllAktif() {
    const aktif = lisensiList.filter((l) => l.aktif && !l.aktivasiPertama).map((l) => l.kode).join("\n");
    navigator.clipboard.writeText(aktif);
    setCopied("all");
    setTimeout(() => setCopied(null), 2000);
  }

  // ── Login screen ──
  if (!authed) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-5">
            <Lock size={20} className="text-orange-500" />
            <h1 className="text-lg font-bold text-stone-800">Admin Takar</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              placeholder="Password admin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 rounded-xl border border-stone-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            {authError && <p className="text-xs text-red-500">{authError}</p>}
            <button type="submit"
              className="w-full h-11 rounded-xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition-colors">
              Masuk
            </button>
          </form>
        </div>
      </div>
    );
  }

  const totalAktif    = lisensiList.filter((l) => l.aktif).length;
  const totalDigunakan = lisensiList.filter((l) => l.aktivasiPertama).length;
  const totalBelumDigunakan = lisensiList.filter((l) => l.aktif && !l.aktivasiPertama).length;

  return (
    <div className="min-h-screen bg-stone-100 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-stone-800">Admin Panel — Takar</h1>
            <p className="text-sm text-stone-400">Manajemen Lisensi</p>
          </div>
          <button onClick={fetchLisensi}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 transition-colors">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total Lisensi",    value: lisensiList.length, color: "text-stone-800" },
            { label: "Aktif",            value: totalAktif,          color: "text-green-600" },
            { label: "Sudah Digunakan",  value: totalDigunakan,      color: "text-orange-600" },
            { label: "Belum Digunakan",  value: totalBelumDigunakan, color: "text-blue-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl p-4 border border-stone-200">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-stone-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Generate kode */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200">
          <div className="flex items-center gap-2 mb-4">
            <Key size={16} className="text-orange-500" />
            <p className="text-sm font-semibold text-stone-700">Generate Kode Baru</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Catatan (opsional, cth: Untuk Siti WA 0812xxx)"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="flex-1 min-w-48 h-10 rounded-xl border border-stone-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <select
              value={jumlahBuat}
              onChange={(e) => setJumlahBuat(parseInt(e.target.value))}
              className="h-10 rounded-xl border border-stone-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {[1, 5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>{n} kode</option>
              ))}
            </select>
            <button onClick={handleGenerate} disabled={generating}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors">
              <Plus size={14} />
              {generating ? "Membuat..." : "Generate"}
            </button>
          </div>
        </div>

        {/* Tabel lisensi */}
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
            <p className="text-sm font-semibold text-stone-700">
              Daftar Lisensi ({lisensiList.length})
            </p>
            {totalBelumDigunakan > 0 && (
              <button onClick={copyAllAktif}
                className="flex items-center gap-1.5 text-xs text-blue-600 font-medium hover:underline">
                {copied === "all" ? <Check size={12} /> : <Copy size={12} />}
                Copy semua yang belum digunakan
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center text-stone-400 text-sm">Memuat...</div>
          ) : lisensiList.length === 0 ? (
            <div className="p-8 text-center text-stone-400 text-sm">Belum ada lisensi. Generate dulu.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-stone-500 uppercase tracking-wide">Kode</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-stone-500 uppercase tracking-wide">Catatan</th>
                    <th className="text-center px-4 py-2.5 text-xs font-semibold text-stone-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-stone-500 uppercase tracking-wide">Aktivasi</th>
                    <th className="text-center px-4 py-2.5 text-xs font-semibold text-stone-500 uppercase tracking-wide">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {lisensiList.map((l) => (
                    <tr key={l.kode} className={`hover:bg-stone-50 transition-colors ${!l.aktif ? "opacity-50" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-stone-800">{l.kode}</span>
                          <button onClick={() => copyKode(l.kode)}
                            className="text-stone-400 hover:text-orange-500 transition-colors">
                            {copied === l.kode ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-stone-500 text-xs">{l.catatanAdmin ?? "—"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          !l.aktif ? "bg-stone-100 text-stone-500" :
                          l.aktivasiPertama ? "bg-orange-100 text-orange-600" :
                          "bg-green-100 text-green-600"
                        }`}>
                          {!l.aktif ? "Nonaktif" : l.aktivasiPertama ? "Digunakan" : "Tersedia"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-stone-400">
                        {l.aktivasiPertama
                          ? new Date(l.aktivasiPertama).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                          : "—"
                        }
                        {l.jumlahAktivasi > 0 && (
                          <span className="ml-1 text-orange-500">({l.jumlahAktivasi}×)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleAktif(l.kode, l.aktif)}
                          className="text-stone-400 hover:text-orange-500 transition-colors"
                          title={l.aktif ? "Nonaktifkan" : "Aktifkan"}>
                          {l.aktif
                            ? <ToggleRight size={20} className="text-green-500" />
                            : <ToggleLeft size={20} />
                          }
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
