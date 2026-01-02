"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
    value: string | null;
    onChange: (url: string) => void;
    disabled?: boolean;
}

export default function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(value);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error("File harus berupa gambar");
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Ukuran file maksimal 5MB");
            return;
        }

        setIsUploading(true);
        const supabase = createClient();

        // Create unique filename
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from("product-images")
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from("product-images")
                .getPublicUrl(filePath);

            setPreview(data.publicUrl);
            onChange(data.publicUrl);
            toast.success("Gambar berhasil diupload");
        } catch (error: any) {
            toast.error("Gagal upload gambar", {
                description: error.message
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview(null);
        onChange("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleClick = () => {
        if (!disabled && !isUploading) {
            fileInputRef.current?.click();
        }
    };

    return (
        <div className="w-full">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled || isUploading}
            />

            <div
                onClick={handleClick}
                className={cn(
                    "relative border-2 border-dashed rounded-lg p-4 transition-colors text-center cursor-pointer overflow-hidden min-h-[150px] flex flex-col items-center justify-center gap-2",
                    "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
            >
                {preview ? (
                    <div className="relative w-full h-full min-h-[200px]">
                        <Image
                            src={preview}
                            alt="Preview"
                            fill
                            className="object-contain rounded-md"
                        />
                        <button
                            onClick={handleRemove}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                            type="button"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <>
                        {isUploading ? (
                            <div className="flex flex-col items-center gap-2 text-zinc-500">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <p className="text-sm">Uploading...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-zinc-500 dark:text-zinc-400">
                                <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                                    <UploadCloud className="w-6 h-6" />
                                </div>
                                <div className="text-sm">
                                    <span className="font-semibold text-orange-600">Klik upload</span> gambar
                                </div>
                                <p className="text-xs text-zinc-400">JPG, PNG, WEBP (Max 5MB)</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
