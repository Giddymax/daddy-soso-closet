"use client";
import { useEffect, useState, useCallback } from "react";
import { Package, Plus, AlertTriangle } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { formatGhanaDateTime } from "@/lib/utils";
import type { Branch } from "@/types";

interface InventoryItem {
  id: string;
  quantity: number;
  restock_threshold: number;
  last_restocked_at: string | null;
  product: { id: string; name: string; category?: { name: string } | null } | null;
}

export default function AdminInventoryPage() {
  const { staff } = useAuthStore();
  const supabase = createBrowserClient();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState(0);
  const [restockNote, setRestockNote] = useState("");
  const [restocking, setRestocking] = useState(false);

  useEffect(() => {
    supabase.from("branches").select("*").order("name").then(({ data }) => {
      setBranches(data ?? []);
      if (data?.length) setSelectedBranch(data[0]);
      setLoadingBranches(false);
    });
  }, [supabase]);

  const load = useCallback(async () => {
    if (!selectedBranch) return;
    setLoadingInventory(true);
    const { data } = await supabase
      .from("inventory")
      .select("*, product:products(id, name, category:categories(name))")
      .eq("branch_id", selectedBranch.id)
      .order("quantity", { ascending: true });
    setInventory((data as InventoryItem[]) ?? []);
    setLoadingInventory(false);
  }, [selectedBranch, supabase]);

  useEffect(() => { load(); }, [load]);

  async function handleRestock() {
    if (!restockItem || restockQty <= 0 || !staff || !selectedBranch) return;
    setRestocking(true);
    await supabase
      .from("inventory")
      .update({ quantity: restockItem.quantity + restockQty, last_restocked_at: new Date().toISOString() })
      .eq("id", restockItem.id);
    await supabase.from("restock_log").insert({
      product_id: restockItem.product?.id, branch_id: selectedBranch.id,
      quantity_added: restockQty, restocked_by: staff.id, notes: restockNote,
    });
    await fetch("/api/notify-restock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        branchName: selectedBranch.display_name,
        productName: restockItem.product?.name,
        quantityAdded: restockQty,
        staffName: staff.full_name,
      }),
    }).catch(() => {});
    setRestockItem(null); setRestockQty(0); setRestockNote("");
    setRestocking(false);
    load();
  }

  function statusBadge(qty: number, threshold: number) {
    if (qty === 0) return <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Out of Stock</span>;
    if (qty <= threshold) return <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">Low Stock</span>;
    return <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold">In Stock</span>;
  }

  if (loadingBranches) return <div className="skeleton h-12 rounded-xl w-48" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-[#023E8A]">Inventory</h1>
          <p className="text-gray-500 text-sm">{selectedBranch?.display_name}</p>
        </div>
        <div className="flex gap-2 ml-auto">
          {branches.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBranch(b)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                selectedBranch?.id === b.id
                  ? "bg-[#0077B6] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-[#0077B6]"
              }`}
            >
              {b.display_name}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8F9FA]">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Product</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Category</th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">Stock</th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Last Restocked</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loadingInventory
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td></tr>
                  ))
                : inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-[#023E8A]">{item.product?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{(item.product?.category as { name: string } | null)?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-center font-bold">{item.quantity}</td>
                      <td className="px-4 py-3 text-center">{statusBadge(item.quantity, item.restock_threshold)}</td>
                      <td className="px-4 py-3 text-right text-gray-400 text-xs">
                        {item.last_restocked_at ? formatGhanaDateTime(item.last_restocked_at) : "Never"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => { setRestockItem(item); setRestockQty(0); }}
                          className="flex items-center gap-1 bg-[#0077B6]/10 text-[#0077B6] px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#0077B6] hover:text-white transition-colors ml-auto"
                        >
                          <Plus size={12} /> Restock
                        </button>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
          {!loadingInventory && inventory.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Package size={32} className="mx-auto mb-2 opacity-30" />
              <p>No inventory items found for this branch.</p>
            </div>
          )}
        </div>
      </div>

      {restockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-playfair text-lg font-bold text-[#023E8A] mb-1">Restock Product</h3>
            <p className="text-sm text-gray-500 mb-4">{restockItem.product?.name}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity to Add</label>
                <input type="number" min={1} value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0077B6] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes (optional)</label>
                <input type="text" value={restockNote} onChange={(e) => setRestockNote(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0077B6] focus:outline-none"
                  placeholder="e.g. New delivery"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setRestockItem(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50">Cancel</button>
                <button onClick={handleRestock} disabled={restockQty <= 0 || restocking}
                  className="flex-1 py-2.5 rounded-xl bg-[#0077B6] text-white text-sm font-semibold hover:bg-[#023E8A] disabled:opacity-50 transition-colors">
                  {restocking ? "Saving…" : "Confirm Restock"}
                </button>
              </div>
              {restockItem.quantity <= restockItem.restock_threshold && (
                <div className="flex items-center gap-2 text-orange-600 text-xs bg-orange-50 p-3 rounded-lg">
                  <AlertTriangle size={14} /> Current stock is low ({restockItem.quantity} units)
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
