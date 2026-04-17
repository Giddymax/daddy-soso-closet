"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { loginSchema, type LoginFormValues } from "@/lib/validators";
import { useAuth } from "@/hooks/useAuth";
import { createBrowserClient } from "@/lib/supabase";

export default function LoginPage() {
  const { signIn, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [sidebarImage, setSidebarImage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "login_sidebar_url")
      .single()
      .then(({ data }) => { if (data?.value) setSidebarImage(data.value); });
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormValues) {
    setError("");
    try {
      await signIn(data.email, data.password);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(
        msg.includes("Invalid login") ? "Incorrect email or password." :
        msg.includes("inactive") ? "Your account has been deactivated. Contact admin." :
        msg
      );
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel – branding */}
      <div className="hidden lg:flex w-1/2 bg-[#023E8A] flex-col items-center justify-center p-12 relative overflow-hidden">
        {sidebarImage ? (
          <Image
            src={sidebarImage}
            alt="Sign-in sidebar"
            fill
            className="object-cover"
            sizes="50vw"
            priority
          />
        ) : (
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-40 h-40 rounded-full border-4 border-[#D4AF37]" />
            <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full border-4 border-[#D4AF37]" />
          </div>
        )}
        <div className="absolute inset-0 bg-[#023E8A]/60" />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <span className="font-playfair font-bold text-[#023E8A] text-3xl">D</span>
          </div>
          <h1 className="font-playfair text-4xl font-bold text-white mb-3">
            Daddy SoSo Closet
          </h1>
          <p className="font-playfair italic text-[#D4AF37] text-xl">
            Fashion. Style. Elegance.
          </p>
          <div className="mt-8 text-white/50 text-sm">
            Staff & Admin Portal
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F8F9FA]">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#0077B6] hover:text-[#023E8A] text-sm mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Website
          </Link>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <h2 className="font-playfair text-2xl font-bold text-[#023E8A] mb-1">
                Welcome back
              </h2>
              <p className="text-gray-500 text-sm">
                Sign in to access your dashboard
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition pr-12"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0077B6] text-white py-3 rounded-xl font-bold hover:bg-[#023E8A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
