"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const {
    user, staff, role, branch, isLoading,
    setUser, setStaff, setRole, setBranch, setLoading, clearAuth,
  } = useAuthStore();

  const signIn = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const { data: authData, error: authError } =
          await supabase.auth.signInWithPassword({ email, password });

        if (authError) throw new Error(authError.message);
        if (!authData.user) throw new Error("Login failed");

        setUser({ id: authData.user.id, email: authData.user.email! });

        const { data: staffData, error: staffError } = await supabase
          .from("staff")
          .select("*, branch:branches(*)")
          .eq("id", authData.user.id)
          .single();

        if (staffError || !staffData) throw new Error("Staff record not found");
        if (!staffData.is_active) throw new Error("Account is inactive. Contact admin.");

        setStaff(staffData);
        setRole(staffData.role);
        // Admin is branch-neutral — they pick a branch per-session via the branch selector.
        // Staff are always tied to their assigned branch.
        setBranch(staffData.role === "admin" ? null : staffData.branch ?? null);

        router.push(staffData.role === "admin" ? "/admin" : "/dashboard");
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Login failed";
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [supabase, router, setUser, setStaff, setRole, setBranch, setLoading]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    clearAuth();
    router.push("/");
  }, [supabase, clearAuth, router]);

  return { user, staff, role, branch, isLoading, signIn, signOut };
}
