"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus, UserX, UserCheck, Trash2, Key, ArrowLeftRight, X, Loader2 } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import type { Staff, Branch } from "@/types";

export default function AdminStaffPage() {
  const { staff: adminStaff } = useAuthStore();
  const supabase = createBrowserClient();
  const [staffList, setStaffList] = useState<(Staff & { branch?: Branch })[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", password: "", phone: "", branch_id: "" });
  const [confirmDelete, setConfirmDelete] = useState<Staff | null>(null);

  const load = useCallback(async () => {
    const [staffRes, branchRes] = await Promise.all([
      supabase.from("staff").select("*, branch:branches(*)").order("created_at"),
      supabase.from("branches").select("*"),
    ]);
    setStaffList((staffRes.data as (Staff & { branch?: Branch })[]) ?? []);
    setBranches(branchRes.data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function handleAddStaff() {
    if (!form.full_name || !form.email || !form.password || !form.branch_id) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/create-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      setShowAdd(false);
      setForm({ full_name: "", email: "", password: "", phone: "", branch_id: "" });
      load();
    } catch (err) { alert(err instanceof Error ? err.message : "Failed to create staff"); }
    finally { setSaving(false); }
  }

  async function toggleActive(s: Staff) {
    await supabase.from("staff").update({ is_active: !s.is_active }).eq("id", s.id);
    load();
  }

  async function switchBranch(s: Staff, branchId: string) {
    await supabase.from("staff").update({ branch_id: branchId }).eq("id", s.id);
    load();
  }

  async function changePassword(s: Staff) {
    const newPwd = prompt(`Enter new password for ${s.full_name}:`);
    if (!newPwd || newPwd.length < 8) { alert("Password must be at least 8 characters"); return; }
    const res = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: s.id, password: newPwd }),
    });
    if (res.ok) alert("Password changed successfully.");
    else alert("Failed to change password.");
  }

  async function deleteStaff() {
    if (!confirmDelete) return;
    const res = await fetch("/api/admin/delete-staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: confirmDelete.id }),
    });
    if (res.ok) { setConfirmDelete(null); load(); }
    else alert("Failed to delete account.");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-[#023E8A]">Staff Management</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage staff accounts.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-[#0077B6] text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#023E8A] transition-colors">
          <Plus size={16} /> Add Staff
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8F9FA]">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Name</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Branch</th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">Status</th>
                <th className="px-4 py-3 text-gray-500 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td></tr>
                  ))
                : staffList.map((s) => {
                    const isAdmin = s.role === "admin";
                    const isSelf = s.id === adminStaff?.id;
                    return (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-[#023E8A]">{s.full_name}</p>
                          <p className="text-xs text-gray-400 capitalize">{s.role}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{s.email}</td>
                        <td className="px-4 py-3">
                          {isAdmin ? (
                            <span className="text-xs text-gray-400 italic">All Branches</span>
                          ) : (
                            <select
                              value={s.branch_id ?? ""}
                              onChange={(e) => switchBranch(s, e.target.value)}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-[#0077B6] focus:outline-none"
                            >
                              {branches.map((b) => <option key={b.id} value={b.id}>{b.display_name}</option>)}
                            </select>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                            {s.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 justify-end">
                            {!isSelf && !isAdmin && (
                              <>
                                <button onClick={() => toggleActive(s)} title={s.is_active ? "Deactivate" : "Activate"}
                                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-yellow-100 text-gray-500 hover:text-yellow-700 transition-colors">
                                  {s.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                                </button>
                                <button onClick={() => changePassword(s)} title="Change Password"
                                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-700 transition-colors">
                                  <Key size={14} />
                                </button>
                                <button onClick={() => setConfirmDelete(s)} title="Delete Account"
                                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors">
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                            {isSelf && <span className="text-xs text-gray-400 italic">You</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-playfair font-bold text-[#023E8A] text-lg">Add Staff Member</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              {[
                { label: "Full Name", key: "full_name", type: "text", placeholder: "Akua Mensah" },
                { label: "Email", key: "email", type: "email", placeholder: "akua@example.com" },
                { label: "Password", key: "password", type: "password", placeholder: "Min. 8 characters" },
                { label: "Phone (optional)", key: "phone", type: "tel", placeholder: "0201234567" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                  <input type={type} placeholder={placeholder} value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0077B6] focus:outline-none"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Branch</label>
                <select value={form.branch_id} onChange={(e) => setForm((f) => ({ ...f, branch_id: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0077B6] focus:outline-none">
                  <option value="">Select branch</option>
                  {branches.map((b) => <option key={b.id} value={b.id}>{b.display_name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold">Cancel</button>
                <button onClick={handleAddStaff} disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[#0077B6] text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 size={14} className="animate-spin" /> Creating…</> : "Create Staff"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <Trash2 size={36} className="text-red-500 mx-auto mb-3" />
            <h3 className="font-bold text-gray-800 mb-2">Delete Account?</h3>
            <p className="text-sm text-gray-500 mb-5">
              This will permanently delete <strong>{confirmDelete.full_name}</strong>&apos;s account. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold">Cancel</button>
              <button onClick={deleteStaff} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
