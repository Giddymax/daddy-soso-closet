"use client";
import { useEffect, useState, useCallback } from "react";
import { Package, Plus, AlertTriangle } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { formatGhanaDateTime } from "@/lib/utils";

interface InventoryItem {
  id: string;
  quantity: number;
  restock_threshold: number;
  last_restocked_at: string | null;
  product: { id: string; name: string; category?: { name: string } | null } | null;
}

export default function InventoryPage() {
  const { staff, branch } = useAuthStore();
  const supabase = createBrowserClient();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState<number | "">("");
  const [restockNote, setRestockNote] = useState("");
  const [restocking, setRestocking] = useState(false);

  const load = useCallback(async () => {
    if (!branch) return;
    const { data } = await supabase
      .from("inventory")
      .select("*, product:products(id, name, category:categories(name))")
      .eq("branch_id", branch.id)
      .order("quantity", { ascending: true });
    setInventory((data as InventoryItem[]) ?? []);
    setLoading(false);
  }, [branch, supabase]);

  useEffect(() => { load(); }, [load]);

  async function handleRestock() {
    const qty = Number(restockQty);
    if (!restockItem || qty <= 0 || !staff || !branch) return;
    setRestocking(true);
    await supabase
      .from("inventory")
      .update({ quantity: restockItem.quantity + qty, last_restocked_at: new Date().toISOString() })
      .eq("id", restockItem.id);
    await supabase.from("restock_log").insert({
      product_id: restockItem.product?.id, branch_id: branch.id,
      quantity_added: qty, restocked_by: staff.id, notes: restockNote,
    });
    await fetch("/api/notify-restock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        branchName: branch.display_name,
        productName: restockItem.product?.name,
        quantityAdded: qty,
        staffName: staff.full_name,
      }),
    }).catch(() => {});
    setRestockItem(null); setRestockQty(""); setRestockNote("");
    setRestocking(false);
    load();
  }

  function statusBadge(qty: number, threshold: number) {
    if (qty === 0) return <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Out of Stock</span>;
    if (qty <= threshold) return <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">Low Stock</span>;
    return <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold">In Stock</span>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-[#2C1A0E] mb-1">Inventory</h1>
        <p className="text-stone-500 text-sm">{branch?.display_name}</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#FAF8F5]">
              <tr>
                <th className="text-left px-4 py-3 text-stone-500 font-medium">Product</th>
                <th className="text-left px-4 py-3 text-stone-500 font-medium">Category</th>
                <th className="text-center px-4 py-3 text-stone-500 font-medium">Stock</th>
                <th className="text-center px-4 py-3 text-stone-500 font-medium">Status</th>
                <th className="text-right px-4 py-3 text-stone-500 font-medium">Last Restocked</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td></tr>
                  ))
                : inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-50">
                      <td className="px-4 py-3 font-medium text-[#2C1A0E]">{item.product?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-stone-500">{(item.product?.category as { name: string } | null)?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-center font-bold">{item.quantity}</td>
                      <td className="px-4 py-3 text-center">{statusBadge(item.quantity, item.restock_threshold)}</td>
                      <td className="px-4 py-3 text-right text-stone-400 text-xs">
                        {item.last_restocked_at ? formatGhanaDateTime(item.last_restocked_at) : "Never"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => { setRestockItem(item); setRestockQty(0); }}
                          className="flex items-center gap-1 bg-[#8B5E3C]/10 text-[#8B5E3C] px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#8B5E3C] hover:text-white transition-colors ml-auto"
                        >
                          <Plus size={12} /> Restock
                        </button>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
          {!loading && inventory.length === 0 && (
            <div className="text-center py-12 text-stone-400">
              <Package size={32} className="mx-auto mb-2 opacity-30" />
              <p>No inventory items found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Restock Modal */}
      {restockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-playfair text-lg font-bold text-[#2C1A0E] mb-1">Restock Product</h3>
            <p className="text-sm text-stone-500 mb-4">{restockItem.product?.name}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Quantity to Add</label>
                <input type="number" min={1} placeholder="Enter quantity"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-[#8B5E3C] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Notes (optional)</label>
                <input type="text" value={restockNote} onChange={(e) => setRestockNote(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-[#8B5E3C] focus:outline-none"
                  placeholder="e.g. New delivery"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setRestockItem(null)} className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm font-semibold hover:bg-stone-50">Cancel</button>
                <button onClick={handleRestock} disabled={!restockQty || Number(restockQty) <= 0 || restocking}
                  className="flex-1 py-2.5 rounded-xl bg-[#2C1A0E] text-white text-sm font-semibold hover:bg-[#8B5E3C] disabled:opacity-50 transition-colors">
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
