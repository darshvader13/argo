"use client";

import { useState, useCallback } from "react";

interface FileDropzoneProps {
    onFileSelect?: (file: File) => void;
}

export default function FileDropzone({ onFileSelect }: FileDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const selectedFile = e.dataTransfer.files[0];
            setFile(selectedFile);
            if (onFileSelect) onFileSelect(selectedFile);
        }
    }, [onFileSelect]);

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFile(null);
    };

    return (
        <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`relative flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all duration-300
        ${isDragging
                    ? "border-primary bg-primary/5 scale-[1.02]"
                    : "border-zinc-700 bg-zinc-900/20 hover:border-zinc-500 hover:bg-zinc-900/50"
                }
      `}
        >
            <div className={`mb-4 rounded-full bg-zinc-800 p-4 transition-colors ${isDragging ? "bg-primary/20 text-primary" : "text-zinc-400"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
            </div>

            {file ? (
                <div className="text-center">
                    <p className="text-lg font-semibold text-white">{file.name}</p>
                    <p className="text-sm text-zinc-500">{(file.size / 1024).toFixed(2)} KB</p>
                    <button
                        onClick={handleRemove}
                        className="mt-4 text-sm text-red-500 hover:text-red-400"
                    >
                        Remove
                    </button>
                </div>
            ) : (
                <div className="text-center">
                    <p className="mb-2 text-lg font-medium text-white">
                        <span className={isDragging ? "text-primary" : "text-zinc-300"}>Drop your statement here</span>, or click to browse
                    </p>
                    <p className="text-sm text-zinc-500">Supports PDF, CSV</p>
                </div>
            )}

            <input
                type="file"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                        const selectedFile = e.target.files[0];
                        setFile(selectedFile);
                        if (onFileSelect) onFileSelect(selectedFile);
                    }
                }}
                accept=".pdf,.csv"
            />
        </div>
    );
}
