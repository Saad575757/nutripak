"use client";

import { useRef, useState } from "react";
import { ImagePlus, LoaderCircle, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  /** Overrides the default "clear" behaviour of the remove button. */
  onRemove?: () => void;
  id?: string;
  alt?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  id,
  alt = "",
  disabled,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Images must be 5 MB or smaller.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      });
      const body = (await response.json().catch(() => null)) as
        | { message?: string; url?: string }
        | null;

      if (!response.ok || !body?.url) {
        toast.error(body?.message ?? "Upload failed.");
        return;
      }

      onChange(body.url);
      toast.success("Image uploaded.");
    } catch {
      toast.error("Upload failed.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-start gap-3">
      <span className="bg-muted flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={alt} className="size-full object-cover" />
        ) : (
          <ImagePlus className="text-muted-foreground size-5" aria-hidden />
        )}
      </span>

      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
          disabled={disabled || isUploading}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || isUploading}
          >
            {isUploading ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
            ) : (
              <Upload className="size-4" aria-hidden />
            )}
            {isUploading ? "Uploading…" : value ? "Replace" : "Upload image"}
          </Button>
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => (onRemove ? onRemove() : onChange(""))}
              disabled={disabled || isUploading}
            >
              <Trash2 className="size-4" aria-hidden /> Remove
            </Button>
          ) : null}
        </div>
        <p className="text-muted-foreground text-xs">
          PNG, JPEG, WebP, GIF or AVIF. Up to 5 MB.
        </p>
      </div>
    </div>
  );
}
