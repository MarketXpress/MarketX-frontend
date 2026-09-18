"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Star, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGES, MAX_IMAGE_BYTES } from "@/lib/listings";

interface ImagePickerProps {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
  error?: string;
}

/**
 * Picks the photographs for a listing.
 *
 * Files are held in memory until the listing is saved, so nothing is uploaded
 * for a listing the seller abandons half way through.
 *
 * The first image is the cover — it is the one the marketplace grid shows and
 * usually the only one anybody sees before deciding to click. It is labelled
 * as such rather than left implicit, because "the first one you happened to
 * select" is not a choice a seller knows they are making.
 */
export default function ImagePicker({ files, onChange, disabled, error }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rejected, setRejected] = useState<string[]>([]);

  // Object URLs are a leak if they are not revoked — every preview holds its
  // file in memory until the document goes away. Regenerated whenever the set
  // changes, and cleaned up on the way out.
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  const accept = useCallback(
    (incoming: FileList | File[]) => {
      const problems: string[] = [];
      const accepted: File[] = [];

      for (const file of Array.from(incoming)) {
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
          problems.push(`${file.name} is not a JPEG, PNG, WebP or AVIF`);
        } else if (file.size > MAX_IMAGE_BYTES) {
          problems.push(`${file.name} is over 5 MB`);
        } else {
          accepted.push(file);
        }
      }

      const room = MAX_IMAGES - files.length;
      if (accepted.length > room) {
        problems.push(`Only ${MAX_IMAGES} photographs per listing — the rest were skipped`);
      }

      setRejected(problems);
      if (accepted.length > 0) onChange([...files, ...accepted.slice(0, room)]);
    },
    [files, onChange],
  );

  const remove = (index: number) => onChange(files.filter((_, i) => i !== index));

  const makeCover = (index: number) => {
    const next = [...files];
    const [picked] = next.splice(index, 1);
    onChange([picked, ...next]);
  };

  const isFull = files.length >= MAX_IMAGES;

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          if (event.target.files) accept(event.target.files);
          // Cleared so selecting the same file twice in a row still fires.
          event.target.value = "";
        }}
      />

      {!isFull && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            if (event.dataTransfer.files) accept(event.dataTransfer.files);
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-10 text-center transition-colors",
            isDragging
              ? "border-accent bg-accent-soft"
              : "border-line-strong bg-surface-2 hover:border-accent hover:bg-accent-soft",
            error && "border-bad",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          <ImagePlus className="h-6 w-6 text-ink-faint" aria-hidden="true" />
          <span className="text-sm font-semibold text-ink">
            Drop photographs here, or click to choose
          </span>
          <span className="text-xs text-ink-faint">
            JPEG, PNG, WebP or AVIF · up to 5 MB each · {MAX_IMAGES - files.length} remaining
          </span>
        </button>
      )}

      {files.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.lastModified}-${index}`}
              className="group relative aspect-square overflow-hidden rounded-lg border border-line bg-surface-2"
            >
              <Image
                src={previews[index]}
                alt={`Photograph ${index + 1} of the item`}
                fill
                sizes="(max-width: 640px) 33vw, 160px"
                className="object-cover"
                // A blob: URL is already local; sending it through the
                // optimizer would mean the server fetching a URL only this
                // browser can resolve.
                unoptimized
              />

              {index === 0 ? (
                <span className="absolute left-1.5 top-1.5 rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-accent">
                  Cover
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => makeCover(index)}
                  className="absolute left-1.5 top-1.5 grid h-6 w-6 place-items-center rounded bg-surface/90 text-ink-muted opacity-0 transition-opacity hover:text-accent focus-visible:opacity-100 group-hover:opacity-100"
                  aria-label={`Make photograph ${index + 1} the cover image`}
                  title="Make cover"
                >
                  <Star className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}

              <button
                type="button"
                onClick={() => remove(index)}
                className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded bg-surface/90 text-ink-muted opacity-0 transition-opacity hover:text-bad focus-visible:opacity-100 group-hover:opacity-100"
                aria-label={`Remove photograph ${index + 1}`}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {rejected.length > 0 && (
        <ul className="space-y-1">
          {rejected.map((message) => (
            <li key={message} className="flex items-start gap-1.5 text-xs text-warn">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {message}
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-xs font-medium text-bad">{error}</p>}
    </div>
  );
}
