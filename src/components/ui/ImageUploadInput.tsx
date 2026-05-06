"use client";

/**
 * Drop-in replacement for <input type="file" accept="image/*" />
 * Shows a popup when image > 5MB offering to compress before upload.
 */

import { useRef, forwardRef } from "react";
import toast from "react-hot-toast";
import { compressImage, fileSizeMB, isImageFile, MAX_IMAGE_MB } from "@/lib/compress-image";

interface Props {
  onFileReady: (file: File) => void;
  className?: string;
  children?: React.ReactNode;
  accept?: string;
}

export default function ImageUploadInput({ onFileReady, className, children, accept }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isImageFile(file) && fileSizeMB(file) > MAX_IMAGE_MB) {
      const sizeMB = fileSizeMB(file).toFixed(1);
      const confirmed = window.confirm(
        `This image is ${sizeMB} MB (over the ${MAX_IMAGE_MB} MB limit).\n\nClick OK to automatically compress it to under ${MAX_IMAGE_MB} MB before uploading.\nClick Cancel to choose a different image.`
      );

      if (!confirmed) {
        if (inputRef.current) inputRef.current.value = "";
        return;
      }

      const toastId = toast.loading("Compressing image…");
      try {
        const compressed = await compressImage(file);
        toast.success(`Compressed to ${fileSizeMB(compressed).toFixed(1)} MB`, { id: toastId });
        onFileReady(compressed);
      } catch {
        toast.error("Compression failed. Please try a smaller image.", { id: toastId });
      }
      return;
    }

    onFileReady(file);
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept || "image/*"}
        onChange={handleChange}
        className={className}
        style={{ display: children ? "none" : undefined }}
      />
      {children && (
        <div onClick={() => inputRef.current?.click()} style={{ cursor: "pointer" }}>
          {children}
        </div>
      )}
    </>
  );
}
