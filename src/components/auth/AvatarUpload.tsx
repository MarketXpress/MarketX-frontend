"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange: (file: File | null) => void;
  className?: string;
}

export default function AvatarUpload({
  currentAvatar,
  onAvatarChange,
  className,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        onAvatarChange(file);
      }
    },
    [onAvatarChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const handleRemove = () => {
    setPreview(null);
    onAvatarChange(null);
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Avatar Preview */}
      <div className="relative">
        <div
          className={cn(
            "w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 bg-white/5 flex items-center justify-center",
            preview && "border-blue-500/30",
          )}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Avatar preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-16 h-16 text-neutral-500" />
          )}
        </div>
        {preview && (
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors shadow-lg"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          "w-full max-w-sm p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all",
          isDragActive
            ? "border-blue-500 bg-blue-500/10"
            : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10",
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center">
            <Upload className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">
              {isDragActive ? "Drop your image here" : "Upload Avatar"}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
