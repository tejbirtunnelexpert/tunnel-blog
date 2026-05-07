"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Upload, X, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [siteName, setSiteName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [pasteUrl, setPasteUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((d) => {
        setSiteName(d.siteName || "");
        setLogoUrl(d.logoUrl || null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function saveName() {
    if (!siteName.trim()) { toast.error("Site name cannot be empty."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteName }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Settings saved!");
      } else {
        toast.error(data.error || "Failed to save.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function savePasteUrl() {
    const url = pasteUrl.trim();
    if (!url) { toast.error("Please enter a URL."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl: url }),
      });
      const data = await res.json();
      if (res.ok) {
        setLogoUrl(url);
        setPasteUrl("");
        toast.success("Logo URL saved!");
      } else {
        toast.error(data.error || "Failed to save.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function removeLogo() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl: "" }),
      });
      if (res.ok) {
        setLogoUrl(null);
        toast.success("Logo removed.");
      } else {
        toast.error("Failed to remove logo.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Get signed upload URL
      const urlRes = await fetch(`/api/admin/upload-logo-url?filename=${encodeURIComponent(file.name)}`);
      if (!urlRes.ok) { toast.error("Could not get upload URL."); return; }
      const { signedUrl, path } = await urlRes.json();

      // Step 2: Upload via XHR with progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", signedUrl, true);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(file);
      });

      // Step 3: Get public URL and save to DB
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/member-files/${path}`;

      const res = await fetch("/api/admin/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl: publicUrl }),
      });

      if (res.ok) {
        setLogoUrl(publicUrl);
        toast.success("Logo uploaded!");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save logo URL.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Upload failed.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-signal-amber" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Site Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage the site name and logo.</p>
      </div>

      {/* Site Name */}
      <div className="tunnel-card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white">Site Name</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-400">Name (max 25 characters)</label>
            <span className={`text-xs font-mono ${siteName.length >= 25 ? "text-red-400" : "text-gray-500"}`}>
              {siteName.length}/25
            </span>
          </div>
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value.slice(0, 25))}
            maxLength={25}
            placeholder="Tejbir Tunnel Expert"
            className="tunnel-input w-full"
          />
        </div>
        <button
          onClick={saveName}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Save Name
        </button>
      </div>

      {/* Logo */}
      <div className="tunnel-card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white">Site Logo</h2>

        {/* Current logo preview */}
        {logoUrl && (
          <div className="flex items-center gap-4 p-3 bg-tunnel-800 rounded-lg border border-tunnel-600">
            <img
              src={logoUrl}
              alt="Current logo"
              className="h-12 w-auto object-contain rounded"
              style={{ maxWidth: "96px" }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 truncate">{logoUrl}</p>
            </div>
            <button
              onClick={removeLogo}
              disabled={saving}
              className="shrink-0 p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Remove logo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {!logoUrl && (
          <div className="flex items-center gap-3 p-4 rounded-lg border border-dashed border-tunnel-600 bg-tunnel-800/50 text-gray-500">
            <ImageIcon className="w-5 h-5 shrink-0" />
            <span className="text-sm">No logo set — Radio icon will be shown as fallback.</span>
          </div>
        )}

        {/* Upload file */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" /> Upload a file
          </label>
          <div className="flex items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={uploadLogo}
              className="hidden"
              id="logo-file-input"
            />
            <label
              htmlFor="logo-file-input"
              className={`btn-primary cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading {uploadProgress}%
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Choose Image
                </>
              )}
            </label>
            {uploading && (
              <div className="flex-1 h-2 bg-tunnel-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-signal-amber rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
          <p className="text-xs text-gray-600">Recommended: square image, PNG or SVG, at least 64×64px.</p>
        </div>

        {/* Or paste URL */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5" /> Or paste an external URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={pasteUrl}
              onChange={(e) => setPasteUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="tunnel-input flex-1"
            />
            <button
              onClick={savePasteUrl}
              disabled={saving || !pasteUrl.trim()}
              className="btn-primary shrink-0"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Use URL"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
