"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, ToggleLeft, ToggleRight, Loader2, X, Upload, Tag, Trash2, AlertTriangle, Search } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import type { Product, Category } from "@/types";
import SupabaseImage from "@/components/shared/SupabaseImage";

interface Branch { id: string; name: string; display_name: string; }

export default function AdminProductsPage() {
  const { staff } = useAuthStore();
  const supabase = createBrowserClient();
  const [products, setProducts] = useState<(Product & { category?: Category })[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", category_id: "", price: "" });
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState("");
  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState<Category | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    const [prodsRes, catsRes, branchesRes] = await Promise.all([
      supabase.from("products").select("*, category:categories(*)").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
      supabase.from("branches").select("id, name, display_name").order("name"),
    ]);
    setProducts((prodsRes.data as (Product & { category?: Category })[]) ?? []);
    setCategories(catsRes.data ?? []);
    setBranches((branchesRes.data ?? []) as Branch[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setEditProduct(null);
    setForm({ name: "", description: "", category_id: "", price: "" });
    setImageFile(null);
    setImagePreview("");
    setSelectedBranchIds([]); // no branches pre-selected — admin must explicitly choose
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditProduct(p);
    setForm({ name: p.name, description: p.description ?? "", category_id: p.category_id, price: String(p.price) });
    setImagePreview(p.image_url ?? "");
    setImageFile(null);
    setShowForm(true);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    if (!form.name || !form.category_id || !form.price) return;
    setSaving(true);
    setSaveError("");
    try {
      let imageUrl = editProduct?.image_url ?? "";
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `products/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, imageFile, { contentType: imageFile.type });
        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }
      const payload = {
        name: form.name, description: form.description,
        category_id: form.category_id, price: Number(form.price),
        image_url: imageUrl, updated_at: new Date().toISOString(),
      };
      if (editProduct) {
        const { error } = await supabase.from("products").update(payload).eq("id", editProduct.id);
        if (error) throw new Error(error.message);
      } else {
        const { data: newProd, error: insertError } = await supabase
          .from("products")
          .insert({ ...payload, created_by: staff?.id, is_active: true })
          .select().single();
        if (insertError) throw new Error(insertError.message);
        if (newProd && selectedBranchIds.length > 0) {
          const { error: invError } = await supabase.from("inventory").insert(
            selectedBranchIds.map((branchId) => ({ product_id: newProd.id, branch_id: branchId, quantity: 0 }))
          );
          if (invError) throw new Error(invError.message);
        }
      }
      setShowForm(false);
      load();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p: Product) {
    setDeleting(true);
    await supabase.from("sale_items").delete().eq("product_id", p.id);
    await supabase.from("inventory").delete().eq("product_id", p.id);
    await supabase.from("products").delete().eq("id", p.id);
    setConfirmDelete(null);
    setDeleting(false);
    load();
  }

  async function toggleActive(p: Product) {
    await supabase.from("products").update({ is_active: !p.is_active }).eq("id", p.id);
    load();
  }

  async function handleAddCategory() {
    const name = newCategoryName.trim();
    if (!name) return;
    setCategoryError("");
    setAddingCategory(true);
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const existing = categories.find(
      (c) => c.slug === slug || c.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) {
      setCategoryError("A category with that name already exists.");
      setAddingCategory(false);
      return;
    }
    const { error } = await supabase.from("categories").insert({ name, slug });
    if (error) setCategoryError(error.message);
    else setNewCategoryName("");
    setAddingCategory(false);
    load();
  }

  async function handleDeleteCategory(cat: Category) {
    const { data: linked } = await supabase
      .from("products").select("id").eq("category_id", cat.id).limit(1);
    if (linked && linked.length > 0) {
      setCategoryError(`Cannot delete "${cat.name}" — it has products assigned to it. Reassign or delete those products first.`);
      setConfirmDeleteCategory(null);
      return;
    }
    setDeletingCategory(cat.id);
    await supabase.from("categories").delete().eq("id", cat.id);
    setDeletingCategory(null);
    setConfirmDeleteCategory(null);
    setCategoryError("");
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-[#023E8A]">Products</h1>
          <p className="text-gray-500 text-sm mt-1">Manage inventory prices and visibility.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setShowCategoryManager(true); setCategoryError(""); }}
            className="flex items-center gap-2 border border-[#0077B6] text-[#0077B6] px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0077B6] hover:text-white transition-colors"
          >
            <Tag size={15} /> Manage Categories
          </button>
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-2 bg-[#0077B6] text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#023E8A] transition-colors"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by name or category…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0077B6] focus:outline-none"
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8F9FA]">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Product</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Category</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Price</th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium sr-only">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td></tr>
                  ))
                : products.filter((p) => {
                    const q = search.toLowerCase();
                    return p.name.toLowerCase().includes(q) || (p.category?.name ?? "").toLowerCase().includes(q);
                  }).map((p) => (
                    <tr key={p.id} className={`hover:bg-gray-50 ${!p.is_active ? "opacity-50" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.image_url ? (
                            <SupabaseImage
                              src={p.image_url}
                              alt={p.name}
                              width={36}
                              height={36}
                              className="rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-xs">IMG</div>
                          )}
                          <span className="font-medium text-[#023E8A]">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{p.category?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-right font-bold text-[#0077B6]">{formatCurrency(p.price)}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleActive(p)}
                          title={p.is_active ? "Deactivate product" : "Activate product"}
                          aria-label={p.is_active ? `Deactivate ${p.name}` : `Activate ${p.name}`}
                          className="text-gray-400 hover:text-[#0077B6] transition-colors"
                        >
                          {p.is_active ? <ToggleRight size={24} className="text-green-500" /> : <ToggleLeft size={24} />}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => openEdit(p)}
                            className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#0077B6] hover:text-white transition-colors"
                          >
                            <Pencil size={12} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(p)}
                            className="flex items-center gap-1 bg-red-50 text-red-500 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-500 hover:text-white transition-colors"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
          {!loading && products.filter((p) => {
            const q = search.toLowerCase();
            return p.name.toLowerCase().includes(q) || (p.category?.name ?? "").toLowerCase().includes(q);
          }).length === 0 && (
            <p className="text-center text-gray-400 py-10 text-sm">
              {search ? `No results for "${search}".` : "No products yet."}
            </p>
          )}
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-playfair font-bold text-[#023E8A] text-lg">
                {editProduct ? "Edit Product" : "Add Product"}
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Close"
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Product Image</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
                  {imagePreview ? (
                    <SupabaseImage
                      src={imagePreview}
                      alt="Preview"
                      width={80}
                      height={80}
                      className="mx-auto rounded-lg object-cover mb-2"
                    />
                  ) : (
                    <Upload size={24} className="mx-auto text-gray-300 mb-2" />
                  )}
                  <label className="cursor-pointer text-xs text-[#0077B6] font-semibold hover:underline">
                    {imagePreview ? "Change Image" : "Upload Image"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="prod-name" className="block text-xs font-semibold text-gray-600 mb-1.5">Product Name</label>
                <input
                  id="prod-name"
                  type="text"
                  placeholder="e.g. Blue Floral Dress"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0077B6] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="prod-price" className="block text-xs font-semibold text-gray-600 mb-1.5">Price (₵)</label>
                <input
                  id="prod-price"
                  type="number"
                  placeholder="e.g. 150"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0077B6] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="prod-category" className="block text-xs font-semibold text-gray-600 mb-1.5">Category</label>
                <select
                  id="prod-category"
                  title="Select product category"
                  value={form.category_id}
                  onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0077B6] focus:outline-none"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="prod-description" className="block text-xs font-semibold text-gray-600 mb-1.5">Description (optional)</label>
                <textarea
                  id="prod-description"
                  title="Product description"
                  placeholder="Optional product description…"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0077B6] focus:outline-none resize-none"
                />
              </div>

              {!editProduct && branches.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Add to Branch(es) *</label>
                  <div className="space-y-2">
                    {branches.map((b) => (
                      <label key={b.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedBranchIds.includes(b.id)}
                          onChange={(e) => {
                            setSelectedBranchIds((prev) =>
                              e.target.checked ? [...prev, b.id] : prev.filter((id) => id !== b.id)
                            );
                          }}
                          className="w-4 h-4 accent-[#0077B6]"
                        />
                        <span className="text-sm font-medium text-[#023E8A]">{b.display_name}</span>
                      </label>
                    ))}
                  </div>
                  {selectedBranchIds.length === 0 && (
                    <p className="text-amber-600 text-xs mt-1.5">Select at least one branch to stock this product.</p>
                  )}
                </div>
              )}

              {saveError && (
                <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{saveError}</p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || (!editProduct && selectedBranchIds.length === 0)}
                  className="flex-1 py-2.5 rounded-xl bg-[#0077B6] text-white text-sm font-semibold hover:bg-[#023E8A] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : "Save Product"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-playfair font-bold text-[#023E8A] text-lg">Manage Categories</h3>
              <button
                type="button"
                aria-label="Close"
                onClick={() => { setShowCategoryManager(false); setCategoryError(""); setNewCategoryName(""); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Add New Category</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => { setNewCategoryName(e.target.value); setCategoryError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddCategory(); }}
                  placeholder="e.g. Handbags"
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0077B6] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim() || addingCategory}
                  className="flex items-center gap-1.5 bg-[#0077B6] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#023E8A] disabled:opacity-50 transition-colors"
                >
                  {addingCategory ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add
                </button>
              </div>
              {categoryError && <p className="text-red-500 text-xs mt-2">{categoryError}</p>}
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                Existing Categories ({categories.length})
              </p>
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {categories.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No categories yet.</p>
                ) : (
                  categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#F8F9FA] hover:bg-blue-50 transition-colors group">
                      <div>
                        <span className="text-sm font-medium text-[#023E8A]">{cat.name}</span>
                        <span className="text-xs text-gray-400 ml-2">/{cat.slug}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setCategoryError(""); setConfirmDeleteCategory(cat); }}
                        disabled={deletingCategory === cat.id}
                        aria-label={`Delete ${cat.name}`}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:bg-red-100 hover:text-red-600 transition-all"
                      >
                        {deletingCategory === cat.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => { setShowCategoryManager(false); setCategoryError(""); setNewCategoryName(""); }}
              className="w-full mt-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Confirm Delete Category */}
      {confirmDeleteCategory && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Delete Category?</h3>
            <p className="text-sm text-gray-500 mb-1">
              You are about to delete <strong>&quot;{confirmDeleteCategory.name}&quot;</strong>.
            </p>
            <p className="text-xs text-gray-400 mb-5">Products using this category must be reassigned first.</p>
            {categoryError && (
              <p className="text-red-500 text-xs mb-4 bg-red-50 p-2 rounded-lg">{categoryError}</p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setConfirmDeleteCategory(null); setCategoryError(""); }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCategory(confirmDeleteCategory)}
                disabled={!!deletingCategory}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingCategory ? <Loader2 size={14} className="animate-spin" /> : null} Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Product */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Delete Product?</h3>
            <p className="text-sm text-gray-500 mb-1">
              You are about to delete <strong>&quot;{confirmDelete.name}&quot;</strong>.
            </p>
            <p className="text-xs text-gray-400 mb-5">
              This will also remove it from all inventory records. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDelete)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : null} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
