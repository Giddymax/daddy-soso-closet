"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Plus, Trash2, ToggleLeft, ToggleRight, Loader2, X,
  Upload, Play, GripVertical, AlertTriangle, Video,
} from "lucide-react";
import { createBrowserClient } from "@/lib/supabase";
import type { Video as VideoType } from "@/types";

export default function AdminVideosPage() {
  const supabase = createBrowserClient();
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<VideoType | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    video_url: "",
    useExternalUrl: false,
  });

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("site_videos")
      .select("*")
      .order("sort_order", { ascending: true });
    setVideos((data as VideoType[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setForm({ title: "", description: "", video_url: "", useExternalUrl: false });
    setVideoFile(null);
    setThumbnailFile(null);
    setThumbnailPreview("");
    setSaveError("");
    setUploadProgress("");
    setShowForm(true);
  }

  function handleVideoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
  }

  function handleThumbnailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    if (!form.title) { setSaveError("Title is required."); return; }
    if (!form.useExternalUrl && !videoFile) { setSaveError("Please upload a video file or use an external URL."); return; }
    if (form.useExternalUrl && !form.video_url) { setSaveError("Please enter a video URL."); return; }

    setSaving(true);
    setSaveError("");

    try {
      let videoUrl = form.video_url;
      let thumbnailUrl = "";

      if (!form.useExternalUrl && videoFile) {
        setUploadProgress("Uploading video…");
        const ext = videoFile.name.split(".").pop();
        const path = `videos/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("site-assets")
          .upload(path, videoFile, { contentType: videoFile.type });
        if (uploadError) throw new Error(`Video upload failed: ${uploadError.message}`);
        const { data: urlData } = supabase.storage.from("site-assets").getPublicUrl(path);
        videoUrl = urlData.publicUrl;
      }

      if (thumbnailFile) {
        setUploadProgress("Uploading thumbnail…");
        const ext = thumbnailFile.name.split(".").pop();
        const path = `thumbnails/${Date.now()}.${ext}`;
        const { error: thumbError } = await supabase.storage
          .from("site-assets")
          .upload(path, thumbnailFile, { contentType: thumbnailFile.type });
        if (!thumbError) {
          const { data: thumbUrlData } = supabase.storage.from("site-assets").getPublicUrl(path);
          thumbnailUrl = thumbUrlData.publicUrl;
        }
      }

      setUploadProgress("Saving…");
      const { error } = await supabase.from("site_videos").insert({
        title: form.title,
        description: form.description,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl || null,
        is_active: true,
        sort_order: videos.length,
        updated_at: new Date().toISOString(),
      });
      if (error) throw new Error(error.message);

      setShowForm(false);
      load();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save video");
    } finally {
      setSaving(false);
      setUploadProgress("");
    }
  }

  async function handleDelete(v: VideoType) {
    setDeleting(true);
    await supabase.from("site_videos").delete().eq("id", v.id);
    setConfirmDelete(null);
    setDeleting(false);
    load();
  }

  async function toggleActive(v: VideoType) {
    await supabase.from("site_videos").update({ is_active: !v.is_active }).eq("id", v.id);
    load();
  }

  function isYouTube(url: string) {
    return url.includes("youtube.com") || url.includes("youtu.be");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-[#023E8A]">Videos</h1>
          <p className="text-gray-500 text-sm mt-1">Upload videos that appear on the main website.</p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#0077B6] text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#023E8A] transition-colors"
        >
          <Plus size={16} /> Add Video
        </button>
      </div>

      {/* Videos Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-52 rounded-2xl" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="card p-12 text-center">
          <Video size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400 text-sm">No videos yet. Add your first video above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((v) => (
            <div
              key={v.id}
              className={`card overflow-hidden ${!v.is_active ? "opacity-50" : ""}`}
            >
              {/* Thumbnail / Preview */}
              <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
                {v.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={v.thumbnail_url}
                    alt={v.title}
                    className="w-full h-full object-cover absolute inset-0"
                  />
                ) : null}
                <div className="relative z-10 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Play size={20} className="text-white ml-1" />
                </div>
                {isYouTube(v.video_url) && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    YouTube
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="font-semibold text-[#023E8A] text-sm truncate">{v.title}</p>
                {v.description && (
                  <p className="text-gray-400 text-xs mt-1 line-clamp-2">{v.description}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <button
                    type="button"
                    onClick={() => toggleActive(v)}
                    className="text-gray-400 hover:text-[#0077B6] transition-colors"
                    title={v.is_active ? "Deactivate" : "Activate"}
                    aria-label={v.is_active ? "Deactivate video" : "Activate video"}
                  >
                    {v.is_active
                      ? <ToggleRight size={22} className="text-green-500" />
                      : <ToggleLeft size={22} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(v)}
                    className="flex items-center gap-1 bg-red-50 text-red-500 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Video Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-playfair font-bold text-[#023E8A] text-lg">Add Video</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600" aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title *</label>
                <input
                  type="text"
                  placeholder="e.g. New Collection Drop"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0077B6] focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description (optional)</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of the video…"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0077B6] focus:outline-none resize-none"
                />
              </div>

              {/* Toggle upload vs URL */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, useExternalUrl: false }))}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    !form.useExternalUrl
                      ? "bg-[#0077B6] text-white border-[#0077B6]"
                      : "bg-white text-gray-500 border-gray-200 hover:border-[#0077B6]"
                  }`}
                >
                  Upload Video File
                </button>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, useExternalUrl: true }))}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    form.useExternalUrl
                      ? "bg-[#0077B6] text-white border-[#0077B6]"
                      : "bg-white text-gray-500 border-gray-200 hover:border-[#0077B6]"
                  }`}
                >
                  YouTube / External URL
                </button>
              </div>

              {/* Video input */}
              {form.useExternalUrl ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Video URL *</label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={form.video_url}
                    onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0077B6] focus:outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">YouTube, Vimeo, or any direct video URL</p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Video File *</label>
                  <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-[#0077B6] transition-colors">
                    <Upload size={20} className="text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-[#0077B6]">
                        {videoFile ? videoFile.name : "Click to upload video"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">MP4, MOV, WEBM — max 500MB</p>
                    </div>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleVideoFileChange}
                    />
                  </label>
                </div>
              )}

              {/* Thumbnail */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Thumbnail (optional)</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-[#0077B6] transition-colors">
                  {thumbnailPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full h-28 object-cover rounded-lg mb-2"
                    />
                  ) : (
                    <div className="h-16 flex items-center justify-center text-gray-300 text-xs mb-1">
                      No thumbnail selected
                    </div>
                  )}
                  <label className="cursor-pointer text-xs text-[#0077B6] font-semibold hover:underline">
                    {thumbnailPreview ? "Change Thumbnail" : "Upload Thumbnail"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
                  </label>
                </div>
              </div>

              {uploadProgress && (
                <p className="text-[#0077B6] text-xs flex items-center gap-2">
                  <Loader2 size={12} className="animate-spin" /> {uploadProgress}
                </p>
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
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[#0077B6] text-white text-sm font-semibold hover:bg-[#023E8A] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : "Save Video"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Delete Video?</h3>
            <p className="text-sm text-gray-500 mb-5">
              You are about to delete <strong>&quot;{confirmDelete.title}&quot;</strong>. This cannot be undone.
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
