import { cn } from "../lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import { IconUpload, IconLoader2, IconDownload, IconSparkles, IconBolt } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import { generateThumbnailVariations } from "../lib/gemini";
import type { ThumbnailVariation } from "../lib/gemini";

const mainVariant = {
    initial: {
        x: 0,
        y: 0,
    },
    animate: {
        x: 20,
        y: -20,
        opacity: 0.9,
    },
};

const secondaryVariant = {
    initial: {
        opacity: 0,
    },
    animate: {
        opacity: 1,
    },
};

export const FileUpload = ({
    onChange,
}: {
    onChange?: (files: File[]) => void;
}) => {
    const [files, setFiles] = useState<File[]>([]);
    const [preview, setPreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [variations, setVariations] = useState<ThumbnailVariation[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'free' | 'pro'>('free');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleGenerate = async () => {
        if (files.length === 0 || !prompt.trim()) return;

        setIsLoading(true);
        setError(null);
        try {
            const results = await generateThumbnailVariations(
                mode === 'pro' ? files[0] : null,
                prompt,
                mode
            );
            setVariations(results);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Something went wrong. Please check your API key.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (newFiles: File[]) => {
        const file = newFiles[0];
        if (file) {
            setFiles([file]);
            setPreview(URL.createObjectURL(file));
        }
        onChange && onChange(newFiles);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const { getRootProps, isDragActive } = useDropzone({
        multiple: false,
        noClick: true,
        onDrop: handleFileChange,
        onDropRejected: (error) => {
            console.log(error);
        },
    });

    return (
        <div
            {...getRootProps()}
            className="w-full bg-white shadow-sm shadow-black/10 ring-1 ring-black/5 rounded-xl mt-9 min-h-[520px] h-[520px] flex flex-col"
        >

            <div className={cn("flex flex-col md:flex-row w-full h-full flex-1", files.length > 0 && "items-stretch")}>
                <motion.div
                    onClick={files.length === 0 ? handleClick : undefined}
                    whileHover={files.length === 0 ? "animate" : ""}
                    className={cn(
                        "p-10 group/file block rounded-lg relative overflow-hidden h-full flex-1 transition-all duration-300",
                        files.length > 0 ? "md:w-1/2" : "w-full cursor-pointer"
                    )}
                >
                    <input
                        ref={fileInputRef}
                        id="file-upload-handle"
                        type="file"
                        onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
                        className="hidden"
                    />
                    <div className=" absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
                        <GridPattern />
                    </div>
                    <div className=" w-full h-full flex flex-col items-center justify-center">
                        <p
                            onClick={(e) => {
                                if (files.length > 0) {
                                    e.stopPropagation();
                                    handleClick();
                                }
                            }}
                            className={cn(
                                "relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base transition-colors",
                                files.length > 0 && "cursor-pointer hover:text-black dark:hover:text-white underline underline-offset-4"
                            )}
                        >
                            {files.length > 0 ? "Change file" : "Upload file"}
                        </p>
                        <p className=" relative z-20 font-sans font-normal text-neutral-400 dark:text-neutral-400 text-base mt-2">
                            {files.length > 0 ? "Click to pick a different image" : "Drag or drop your files here or click to upload"}
                        </p>
                        <div className="relative w-full mt-10 max-w-xl mx-auto">
                            {files.length > 0 &&
                                files.map((file, idx) => (
                                    <motion.div
                                        key={"file" + idx}
                                        layoutId={idx === 0 ? "file-upload" : "file-upload-" + idx}
                                        className={cn(
                                            "relative overflow-hidden z-40 bg-white dark:bg-neutral-900 flex flex-col items-start justify-start  p-4 mt-4 w-full mx-auto rounded-md",
                                            "shadow-sm"
                                        )}
                                    >
                                        {preview && (
                                            <div className="w-full h-48 mb-4 overflow-hidden rounded-md">
                                                <img
                                                    src={preview}
                                                    alt="preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex justify-between w-full items-center gap-4">
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                layout
                                                className="text-base text-neutral-700 dark:text-neutral-300 truncate max-w-xs font-medium"
                                            >
                                                {file.name}
                                            </motion.p>
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                layout
                                                className="rounded-lg px-2 py-1 w-fit shrink-0 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-white shadow-input"
                                            >
                                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                                            </motion.p>
                                        </div>

                                        <div className="flex text-sm md:flex-row flex-col items-start md:items-center w-full mt-2 justify-between text-neutral-600 dark:text-neutral-400">
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                layout
                                                className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 "
                                            >
                                                {file.type}
                                            </motion.p>

                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                layout
                                            >
                                                modified{" "}
                                                {new Date(file.lastModified).toLocaleDateString()}
                                            </motion.p>
                                        </div>
                                    </motion.div>
                                ))}
                            {!files.length && (
                                <motion.div
                                    layoutId="file-upload"
                                    variants={mainVariant}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 20,
                                    }}
                                    className={cn(
                                        "relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md",
                                        "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                                    )}
                                >
                                    {isDragActive ? (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-neutral-600 flex flex-col items-center"
                                        >
                                            Drop it
                                            <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                                        </motion.p>
                                    ) : (
                                        <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                                    )}
                                </motion.div>
                            )}

                            {!files.length && (
                                <motion.div
                                    variants={secondaryVariant}
                                    className="absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md"
                                ></motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {files.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 p-10 border-t md:border-t-0 md:border-l border-neutral-100 dark:border-neutral-800 flex flex-col relative z-50 overflow-hidden"
                    >
                        <div className="absolute inset-0 mask-[radial-gradient(ellipse_at_center,white,transparent)]">
                            <GridPattern />
                        </div>
                        <h3 className=" z-20 text-xl text-center font-bold text-neutral-600 mb-3">
                            What would you like to generate?
                        </h3>

                        {/* Mode Toggle */}
                        <div className="relative z-20 flex items-center justify-center gap-2 mb-4 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setMode('free')}
                                className={cn(
                                    "flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2",
                                    mode === 'free'
                                        ? "bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-white"
                                        : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                                )}
                            >
                                <IconBolt className="w-4 h-4" />
                                Free Mode
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('pro')}
                                className={cn(
                                    "flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2",
                                    mode === 'pro'
                                        ? "bg-gradient-to-r from-purple-500 to-pink-500 shadow-sm text-white"
                                        : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                                )}
                            >
                                <IconSparkles className="w-4 h-4" />
                                Pro Mode
                            </button>
                        </div>

                        {mode === 'pro' && !localStorage.getItem('google_gemini_api_key') && (
                            <p className="relative z-20 text-xs text-amber-600 dark:text-amber-400 text-center mb-2">
                                ⚠️ Pro mode requires a Gemini API key (top right)
                            </p>
                        )}

                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the changes or details for your thumbnail..."
                            className=" text-normal relative z-20 flex-1 w-full p-4 rounded-xl dark:bg-neutral-800 border-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all resize-none text-neutral-700 dark:text-neutral-300 placeholder:text-neutral-400"
                        />
                        <button
                            type="button"
                            onClick={handleGenerate}
                            disabled={!prompt.trim() || isLoading}
                            className="cursor-pointer border border-b-gray-700  mt-4 w-full py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed relative z-30 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <IconLoader2 className="w-5 h-5 animate-spin" />
                                    Generating Thumbnails...
                                </>
                            ) : (
                                "Generate Thumbnail"
                            )}
                        </button>
                        {error && (
                            <p className="mt-2 text-sm text-red-500 text-center relative z-40 font-medium">
                                {error}
                            </p>
                        )}
                    </motion.div>
                )}
            </div>

            {variations.length > 0 && (
                <div className="w-full mt-10 p-6 md:p-10 border-t border-neutral-100 dark:border-neutral-800">
                    <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-8 text-center">
                        Generated Variations
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {variations.map((v) => (
                            <div key={v.id} className="group relative flex flex-col gap-4">
                                {/* Mode Badge */}
                                <div className={cn(
                                    "absolute top-2 left-2 z-10 px-2 py-1 rounded-full text-xs font-medium",
                                    v.mode === 'pro'
                                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                        : "bg-white/90 dark:bg-neutral-800/90 text-neutral-600 dark:text-neutral-300"
                                )}>
                                    {v.mode === 'pro' ? '✨ Pro' : '⚡ Free'}
                                </div>
                                <div className="aspect-video w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800 ring-1 ring-black/5 shadow-md flex items-center justify-center">
                                    {v.url ? (
                                        <>
                                            <img
                                                src={v.url}
                                                alt="variation"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                <a
                                                    href={v.url}
                                                    download={`thumbnail-${v.id}.png`}
                                                    className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform shadow-xl"
                                                    title="Download Image"
                                                >
                                                    <IconDownload className="w-6 h-6" />
                                                </a>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="p-6 text-center">
                                            <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-2">
                                                Image generation requires Vertex AI
                                            </p>
                                            <p className="text-xs text-neutral-300 dark:text-neutral-600">
                                                Prompt generated successfully ↓
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-3 italic px-2">
                                    "{v.promptUsed}"
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export function GridPattern() {
    const columns = 41;
    const rows = 11;
    return (
        <div className="flex bg-gray-100 dark:bg-neutral-900 shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px  scale-105">
            {Array.from({ length: rows }).map((_, row) =>
                Array.from({ length: columns }).map((_, col) => {
                    const index = row * columns + col;
                    return (
                        <div
                            key={`${col}-${row}`}
                            className={`size-10 flex shrink-0 rounded-[2px] ${index % 2 === 0
                                ? "bg-gray-50 dark:bg-neutral-950"
                                : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
                                }`}
                        />
                    );
                })
            )}
        </div>
    );
}
