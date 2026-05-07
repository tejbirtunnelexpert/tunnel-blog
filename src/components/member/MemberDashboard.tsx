"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Radio, LogOut, FileText, Download, Users, FolderOpen,
  File, Image as ImageIcon, Presentation, FileSpreadsheet,
} from "lucide-react";
import toast from "react-hot-toast";

interface Category { id: number; name: string; sort_order: number; }
interface MemberFile {
  id: string; title: string; description: string | null;
  file_url: string; file_name: string | null; file_size: number | null;
  file_type: string | null; category_id: number | null;
  category: { id: number; name: string } | null;
  created_at: string;
}
interface Member { id: string; name: string; email: string; company: string | null; position: string | null; }

function fileIcon(type: string | null) {
  if (!type) return <File className="w-5 h-5" />;
  if (type.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-blue-400" />;
  if (type.includes("pdf")) return <FileText className="w-5 h-5 text-red-400" />;
  if (type.includes("presentation") || type.includes("powerpoint") || type.includes("ppt"))
    return <Presentation className="w-5 h-5 text-orange-400" />;
  if (type.includes("word") || type.includes("document"))
    return <FileSpreadsheet className="w-5 h-5 text-blue-400" />;
  return <File className="w-5 h-5 text-gray-400" />;
}

function formatBytes(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isPptFile(url: string) {
  return /\.(ppt|pptx|ppts)(\?|$)/i.test(url);
}

function officeViewerUrl(fileUrl: string) {
  return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`;
}

export default function MemberDashboard({ member, categories, files }: {
  member: Member;
  categories: Category[];
  files: MemberFile[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<number | "all">("all");

  async function handleLogout() {
    await fetch("/api/member/logout", { method: "POST" });
    toast.success("Logged out");
    router.push("/member/login");
    router.refresh();
  }

  const visibleFiles = activeTab === "all"
    ? files
    : files.filter(f => f.category_id === activeTab);

  return (
    <div className="min-h-screen bg-tunnel-950">
      {/* Top bar */}
      <header className="bg-tunnel-900 border-b border-tunnel-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-signal-amber/10 border border-signal-amber/40 flex items-center justify-center">
                <Radio className="w-3.5 h-3.5 text-signal-amber" />
              </div>
              <span className="font-semibold text-sm text-white hidden sm:block">
                Tejbir <span className="text-signal-amber">Tunnel Expert</span>
              </span>
            </Link>
            <span className="text-tunnel-600">|</span>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-signal-amber" />
              <span className="text-sm font-medium text-signal-amber">Member Area</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-medium text-white">{member.name}</div>
              <div className="text-xs text-gray-500">{member.position || member.email}</div>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors px-2 py-1.5 rounded hover:bg-red-500/5">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">
            Welcome, <span className="text-signal-amber">{member.name}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Access your exclusive technical resources and reference materials below.
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all shrink-0 ${
              activeTab === "all"
                ? "bg-signal-amber text-tunnel-900"
                : "bg-tunnel-800 text-gray-400 hover:text-white border border-tunnel-700"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5" />
              All Files
              <span className="text-xs opacity-70">({files.length})</span>
            </span>
          </button>
          {categories.map(cat => {
            const count = files.filter(f => f.category_id === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all shrink-0 ${
                  activeTab === cat.id
                    ? "bg-signal-amber text-tunnel-900"
                    : "bg-tunnel-800 text-gray-400 hover:text-white border border-tunnel-700"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5" />
                  {cat.name}
                  <span className="text-xs opacity-70">({count})</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Files grid */}
        {visibleFiles.length === 0 ? (
          <div className="tunnel-card p-12 text-center">
            <FolderOpen className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No files in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleFiles.map(file => (
              <div key={file.id} className="tunnel-card p-4 flex flex-col gap-3 hover:border-tunnel-600 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-tunnel-800 border border-tunnel-700 flex items-center justify-center shrink-0">
                    {fileIcon(file.file_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white leading-snug truncate">{file.title}</div>
                    {file.category && (
                      <div className="text-xs text-signal-amber mt-0.5">{file.category.name}</div>
                    )}
                    {file.description && (
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">{file.description}</div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-auto">
                  <span className="text-xs text-gray-600">
                    {file.file_name?.split(".").pop()?.toUpperCase() || "FILE"}
                    {file.file_size ? ` · ${formatBytes(file.file_size)}` : ""}
                  </span>
                  <div className="flex items-center gap-2">
                    {isPptFile(file.file_url) && (
                      <a
                        href={officeViewerUrl(file.file_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs bg-blue-600/20 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-md hover:bg-blue-600/30 transition-colors flex-1 justify-center"
                      >
                        <Presentation className="w-3 h-3" />
                        View Online
                      </a>
                    )}
                    <a
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={file.file_name || true}
                      className="flex items-center gap-1.5 text-xs bg-signal-amber/10 text-signal-amber border border-signal-amber/20 px-3 py-1.5 rounded-md hover:bg-signal-amber/20 transition-colors flex-1 justify-center"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
