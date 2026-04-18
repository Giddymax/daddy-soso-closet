"use client";
import { useEffect, useState, useCallback } from "react";
import { Trash2, Save, ChevronDown, ChevronUp, Printer, ReceiptText } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase";
import { formatCurrency, formatGhanaDateTime } from "@/lib/utils";
import ReceiptModal from "@/components/dashboard/ReceiptModal";
import type { CartItem } from "@/types";

interface SaleRow {
  id: string;
  receipt_number: string;
  total_amount: number;
  payment_method: string;
  notes: string | null;
  created_at: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  branch: { display_name: string; location: string } | null;
  staff: { full_name: string } | null;
  sale_items: { id: string; quantity: number; unit_price: number; product: { name: string } | null }[];
}

const PAY_LABEL: Record<string, string> = { cash: "Cash", momo: "MoMo", card: "Card" };

export default function AdminSalesPage() {
  const supabase = createBrowserClient();
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, { payment_method: string; notes: string; total_amount: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [branches, setBranches] = useState<{ id: string; name: string; display_name: string }[]>([]);
  const [selectedSale, setSelectedSale] = useState<SaleRow | null>(null);
  const [phone, setPhone] = useState("0594299293");

  useEffect(() => {
    supabase.from("branches").select("id, name, display_name").then(({ data }) => setBranches(data ?? []));
    supabase.from("site_settings").select("value").eq("key", "phone_number").single()
      .then(({ data }) => { if (data?.value) setPhone(data.value); });
  }, [supabase]);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("sales")
      .select("*, branch:branches(display_name, location), staff:staff(full_name), sale_items(id, quantity, unit_price, product:products(name))")
      .order("created_at", { ascending: false })
      .limit(200);

    if (dateFilter) {
      const s = new Date(dateFilter); s.setHours(0, 0, 0, 0);
      const e = new Date(dateFilter); e.setHours(23, 59, 59, 999);
      query = query.gte("created_at", s.toISOString()).lte("created_at", e.toISOString());
    }
    if (branchFilter !== "all") {
      const b = branches.find((br) => br.name === branchFilter);
      if (b) query = query.eq("branch_id", b.id);
    }

    const { data } = await query;
    setSales((data as unknown as SaleRow[]) ?? []);
    setLoading(false);
  }, [supabase, dateFilter, branchFilter, branches]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-sales-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "sales" }, () => { load(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, load]);

  function toggleExpand(sale: SaleRow) {
    if (expanded === sale.id) { setExpanded(null); return; }
    setExpanded(sale.id);
    if (!edits[sale.id]) {
      setEdits((prev) => ({
        ...prev,
        [sale.id]: { payment_method: sale.payment_method, notes: sale.notes ?? "", total_amount: String(sale.total_amount) },
      }));
    }
  }

  async function saveEdit(saleId: string) {
    const edit = edits[saleId];
    if (!edit) return;
    setSaving(saleId);
    await supabase.from("sales").update({
      payment_method: edit.payment_method,
      notes: edit.notes,
      total_amount: Number(edit.total_amount),
    }).eq("id", saleId);
    setSaving(null);
    load();
  }

  async function deleteSale(saleId: string) {
    if (!confirm("Permanently delete this sale? This cannot be undone.")) return;
    await supabase.from("sales").delete().eq("id", saleId);
    setSales((prev) => prev.filter((s) => s.id !== saleId));
    if (expanded === saleId) setExpanded(null);
  }

  function saleToCartItems(sale: SaleRow): CartItem[] {
    return sale.sale_items.map((si) => ({
      product_id: si.id,
      name: si.product?.name ?? "Unknown",
      price: si.unit_price,
      quantity: si.quantity,
      max_quantity: 99,
    }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-[#023E8A]">Sales</h1>
        <p className="text-gray-500 text-sm mt-1">All sales records — click a row to edit or print receipt.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0077B6] focus:outline-none"
        >
          <option value="all">All Branches</option>
          {branches.map((b) => <option key={b.id} value={b.name}>{b.display_name}</option>)}
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0077B6] focus:outline-none"
        />
        {dateFilter && (
          <button
            onClick={() => setDateFilter("")}
            className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl"
          >
            Clear date
          </button>
        )}
      </div>

      {/* Sales list */}
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-2xl" />)
        ) : sales.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ReceiptText size={36} className="mx-auto mb-2 opacity-30" />
            <p>No sales found{dateFilter ? " for this date" : ""}.</p>
          </div>
        ) : (
          sales.map((sale) => {
            const isOpen = expanded === sale.id;
            const edit = edits[sale.id];
            return (
              <div key={sale.id} className="card overflow-hidden">
                {/* Row header */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(sale)}
                >
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-0.5 min-w-0">
                    <span className="font-mono text-xs text-[#0077B6] font-semibold">{sale.receipt_number}</span>
                    <span className="text-xs text-gray-500 truncate">{sale.branch?.display_name}</span>
                    <span className="text-xs text-gray-400 truncate">{sale.staff?.full_name}</span>
                    <span className="text-xs text-gray-400">{formatGhanaDateTime(sale.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      sale.payment_method === "cash" ? "bg-green-100 text-green-700" :
                      sale.payment_method === "momo" ? "bg-yellow-100 text-yellow-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>{PAY_LABEL[sale.payment_method] ?? sale.payment_method}</span>
                    <span className="font-bold text-[#023E8A] text-sm">{formatCurrency(Number(sale.total_amount))}</span>
                    {/* Print button — stops propagation so it doesn't toggle expand */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedSale(sale); }}
                      className="p-1.5 rounded-lg bg-[#0077B6]/10 text-[#0077B6] hover:bg-[#0077B6] hover:text-white transition-colors"
                      title="Print receipt"
                    >
                      <Printer size={14} />
                    </button>
                    {isOpen ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
                  </div>
                </div>

                {/* Expanded edit panel */}
                {isOpen && edit && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-4">
                    {/* Items table */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Items</h4>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-gray-400 border-b border-gray-100">
                            <th className="text-left pb-1.5">Product</th>
                            <th className="text-center pb-1.5 w-12">Qty</th>
                            <th className="text-right pb-1.5">Unit Price</th>
                            <th className="text-right pb-1.5">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sale.sale_items.map((si) => (
                            <tr key={si.id} className="border-t border-gray-100">
                              <td className="py-1.5 text-gray-700">{si.product?.name ?? "—"}</td>
                              <td className="py-1.5 text-center text-gray-600">{si.quantity}</td>
                              <td className="py-1.5 text-right text-gray-600">{formatCurrency(si.unit_price)}</td>
                              <td className="py-1.5 text-right font-semibold text-[#023E8A]">{formatCurrency(si.quantity * si.unit_price)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Edit fields */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Edit Record</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Total (GH₵)</label>
                          <input
                            type="number"
                            value={edit.total_amount}
                            onChange={(e) => setEdits((p) => ({ ...p, [sale.id]: { ...edit, total_amount: e.target.value } }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0077B6] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Method</label>
                          <select
                            value={edit.payment_method}
                            onChange={(e) => setEdits((p) => ({ ...p, [sale.id]: { ...edit, payment_method: e.target.value } }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0077B6] focus:outline-none bg-white"
                          >
                            <option value="cash">Cash</option>
                            <option value="momo">MoMo</option>
                            <option value="card">Card</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                          <input
                            type="text"
                            value={edit.notes}
                            placeholder="Optional note…"
                            onChange={(e) => setEdits((p) => ({ ...p, [sale.id]: { ...edit, notes: e.target.value } }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0077B6] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => deleteSale(sale.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                      <button
                        onClick={() => saveEdit(sale.id)}
                        disabled={saving === sale.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#0077B6] text-white rounded-lg text-xs font-semibold hover:bg-[#023E8A] disabled:opacity-50 transition-colors"
                      >
                        <Save size={13} /> {saving === sale.id ? "Saving…" : "Save Changes"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Receipt modal */}
      {selectedSale && (
        <ReceiptModal
          receiptNumber={selectedSale.receipt_number}
          items={saleToCartItems(selectedSale)}
          total={Number(selectedSale.total_amount)}
          paymentMethod={selectedSale.payment_method}
          staffName={selectedSale.staff?.full_name ?? ""}
          branchName={selectedSale.branch?.display_name ?? ""}
          branchLocation={selectedSale.branch?.location ?? ""}
          phone={phone}
          customerName={selectedSale.customer_name ?? ""}
          customerPhone={selectedSale.customer_phone ?? ""}
          onClose={() => setSelectedSale(null)}
        />
      )}
    </div>
  );
}
