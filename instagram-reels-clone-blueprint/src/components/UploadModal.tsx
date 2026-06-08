import { useEffect, useRef, useState } from "react";
import { useStore } from "../store";
import { CloseIcon, PlusSquareIcon } from "./Icons";

export function UploadModal() {
  const { uploadOpen, setUploadOpen, createPost, navigate, currentUser } = useStore();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [type, setType] = useState<"image" | "reel">("image");
  const [caption, setCaption] = useState("");
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!uploadOpen) {
      setFile(null);
      setPreview(null);
      setCaption("");
      setType("image");
    }
  }, [uploadOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setUploadOpen(false); };
    if (uploadOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [uploadOpen, setUploadOpen]);

  if (!uploadOpen) return null;

  const onFiles = (files: FileList | null) => {
    if (!files || !files[0]) return;
    const f = files[0];
    setFile(f);
    const isVideo = f.type.startsWith("video");
    setType(isVideo ? "reel" : "image");
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const submit = () => {
    if (!preview) return;
    createPost({ type, mediaUrl: preview, caption, thumbnail: type === "reel" ? undefined : preview });
    setUploadOpen(false);
    if (currentUser) {
      if (type === "reel") navigate({ name: "reels" });
      else navigate({ name: "profile", username: currentUser.username });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3" onClick={() => setUploadOpen(false)}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden text-white"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <span className="font-semibold text-sm">Create new {type === "reel" ? "Reel" : "post"}</span>
          <div className="flex items-center gap-3">
            {preview && (
              <button onClick={submit} className="text-blue-400 font-semibold text-sm">Share</button>
            )}
            <button onClick={() => setUploadOpen(false)} aria-label="Close"><CloseIcon className="w-5 h-5" /></button>
          </div>
        </div>

        {!preview ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); onFiles(e.dataTransfer.files); }}
            className={`p-10 md:p-16 flex flex-col items-center justify-center text-center transition ${drag ? "bg-zinc-900" : ""}`}
          >
            <PlusSquareIcon className="w-16 h-16 text-zinc-300 mb-4" />
            <p className="text-lg">Drag photos and videos here</p>
            <p className="text-sm text-zinc-500 mt-1 mb-5">Videos become Reels · Images become Posts</p>
            <button
              onClick={() => inputRef.current?.click()}
              className="bg-blue-500 hover:bg-blue-600 text-sm font-semibold px-4 py-2 rounded-md"
            >
              Select from device
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => onFiles(e.target.files)}
            />
          </div>
        ) : (
          <div className="grid md:grid-cols-[1fr_280px]">
            <div className="bg-black aspect-square md:aspect-auto md:h-[480px] flex items-center justify-center overflow-hidden">
              {type === "image" ? (
                <img src={preview} alt="" className="w-full h-full object-contain" />
              ) : (
                <video src={preview} className="w-full h-full object-contain" controls autoPlay muted loop playsInline />
              )}
            </div>
            <div className="p-4 border-t md:border-t-0 md:border-l border-zinc-800 flex flex-col">
              {currentUser && (
                <div className="flex items-center gap-2 mb-3">
                  <img src={currentUser.avatar} alt="" className="w-7 h-7 rounded-full" />
                  <span className="text-sm font-semibold">{currentUser.username}</span>
                </div>
              )}
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption..."
                rows={6}
                maxLength={2200}
                className="w-full flex-1 bg-transparent text-sm focus:outline-none resize-none placeholder:text-zinc-500"
              />
              <div className="flex items-center justify-between text-xs text-zinc-500 mt-2">
                <span>{type === "reel" ? "Posting as Reel" : "Posting as Photo"}</span>
                <span>{caption.length}/2200</span>
              </div>
              <button
                onClick={() => { setFile(null); setPreview(null); }}
                className="mt-3 text-sm text-zinc-300 hover:text-white"
              >
                Choose different file
              </button>
            </div>
          </div>
        )}
        {file && <span className="hidden">{file.name}</span>}
      </div>
    </div>
  );
}
