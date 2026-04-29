"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { useFormContext } from "react-hook-form";
import { X, UploadCloud, Image as ImageIcon } from "lucide-react";
import { ListingFormData } from "@/lib/validations/listing";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "../animations/ScrollReveal";

export default function Step3Media() {
  const { setValue, watch, formState: { errors } } = useFormContext<ListingFormData>();
  const [previews, setPreviews] = useState<{url: string, file: File}[]>([]);

  const mediaFiles = watch("media");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newPreviews = acceptedFiles.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));

    const combinedFiles = [...(mediaFiles || []), ...acceptedFiles];
    setValue("media", combinedFiles, { shouldValidate: true, shouldDirty: true });

    setPreviews(prev => [...prev, ...newPreviews]);
  }, [mediaFiles, setValue]);

  const removeFile = (indexToRemove: number) => {
    if (previews[indexToRemove]) {
      URL.revokeObjectURL(previews[indexToRemove].url);
    }

    const newFiles = [...(mediaFiles || [])];
    newFiles.splice(indexToRemove, 1);
    setValue("media", newFiles, { shouldValidate: true, shouldDirty: true });

    setPreviews(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxSize: 5242880,
  });

  return (
    <ScrollReveal className="w-full h-full flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-3xl font-black mb-2">Asset Media</h2>
        <p className="text-neutral-400">High-quality images increase trust and conversions significantly.</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <div
          {...getRootProps()}
          role="button"
          aria-label="Upload images by dragging and dropping or clicking"
          tabIndex={0}
          className={cn(
            "border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300",
            isDragActive
              ? "border-blue-500 bg-blue-500/10 scale-[1.02]"
              : errors.media
                ? "border-red-500/50 hover:bg-white/5"
                : "border-white/10 hover:border-blue-500/50 hover:bg-white/5"
          )}
        >
          <input {...getInputProps()} aria-label="File upload" />
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors duration-300",
            isDragActive ? "bg-blue-500 text-white shadow-[0_0_30px_rgba(59,130,246,0.5)]" : "bg-white/5 text-neutral-400 shadow-inner"
          )}>
            <UploadCloud className="w-10 h-10" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {isDragActive ? "Drop your files here!" : "Drag & drop your images"}
          </h3>
          <p className="text-neutral-500 text-sm max-w-sm">
            Supports JPG, PNG, GIF, and WEBP. Maximum file size 5MB. You can upload multiple files at once.
          </p>
        </div>

        {errors.media && <p className="text-sm text-red-500 font-bold" role="alert">{errors.media.message?.toString()}</p>}

        {/* Previews Grid */}
        {previews.length > 0 && (
          <div className="space-y-3" aria-label="Uploaded image previews">
            <h4 className="text-sm font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-400" aria-hidden="true" /> Uploaded Previews ({previews.length})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {previews.map((preview, index) => (
                <div key={preview.url} className="relative group aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black/50">
                  <Image
                    src={preview.url}
                    alt={`Preview ${index + 1}`}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                      aria-label={`Remove image ${index + 1}`}
                      className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 hover:scale-110 transition-all shadow-xl"
                    >
                      <X className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollReveal>
  );
}
