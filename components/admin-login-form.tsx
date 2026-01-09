"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyRound, Loader2, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export function AdminLoginForm() {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockTime, setLockTime] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockTime !== null && lockTime > 0) {
      timer = setInterval(() => {
        setLockTime((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (lockTime === 0) {
      setLockTime(null);
      setError(null);
    }
    return () => clearInterval(timer);
  }, [lockTime]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Login Berhasil!");
        router.push("/admin");
        router.refresh();
      } else {
        if (data.error === "locked") {
          setError(`Terlalu banyak percobaan. Terkunci selama ${data.remaining} detik.`);
          setLockTime(data.remaining);
          toast.error("Akun terkunci sementara.");
        } else if (data.error === "wrong-key") {
          setError(`Admin Key salah. Percobaan ke-${data.attempts}/3.`);
          toast.error("Admin Key Salah!");
        } else {
          setError("Terjadi kesalahan server.");
          toast.error("Login Gagal!");
        }
      }
    } catch (err) {
      setError("Koneksi gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-blue-900 flex items-center gap-2">
          <KeyRound className="w-4 h-4" />
          Admin Key
        </label>
        <Input
          type="password"
          placeholder="••••••••"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          disabled={loading || lockTime !== null}
          className="bg-blue-50 border-blue-100 focus:ring-blue-500 focus:border-blue-500 rounded-xl"
        />
      </div>

      {error && (
        <div className={`p-3 rounded-xl flex items-center gap-3 text-sm ${lockTime ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
          {lockTime ? <Clock className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{error}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || lockTime !== null || !key}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : lockTime !== null ? (
          `Tunggu ${lockTime}s`
        ) : (
          "Login Admin"
        )}
      </Button>
    </form>
  );
}
