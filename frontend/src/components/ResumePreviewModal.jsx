import { ExternalLink, X } from "lucide-react";
import { useEffect, useState } from "react";
import { GhostButton, GlassCard } from "./ui/Primitives";

function isPdf(url) {
  return /\.pdf(?:$|[?#])/i.test(url);
}

function isOfficeDocument(url, type = "") {
  const normalizedType = type.toLowerCase();
  return (
    normalizedType.includes("word") ||
    normalizedType.includes("officedocument") ||
    /\.(doc|docx)(?:$|[?#])/i.test(url)
  );
}

function isImage(url, type = "") {
  return type.startsWith("image/") || /\.(png|jpe?g|webp|gif)(?:$|[?#])/i.test(url);
}

function shouldTreatAsPdf(url, type = "") {
  const normalizedType = type.toLowerCase();
  return (
    normalizedType === "application/pdf" ||
    normalizedType === "application/octet-stream" ||
    normalizedType === "binary/octet-stream" ||
    normalizedType === "" ||
    isPdf(url) ||
    url.includes("/raw/upload/")
  );
}

export default function ResumePreviewModal({ resumeUrl, onClose }) {
  const [preview, setPreview] = useState({
    loading: true,
    url: "",
    type: "",
    error: "",
  });

  useEffect(() => {
    if (!resumeUrl) return undefined;

    let active = true;
    let objectUrl = "";

    async function loadResume() {
      setPreview({ loading: true, url: "", type: "", error: "" });
      try {
        const response = await fetch(resumeUrl);
        if (!response.ok) throw new Error("Resume preview could not be loaded.");
        const blob = await response.blob();
        const previewBlob = shouldTreatAsPdf(resumeUrl, blob.type) && !isOfficeDocument(resumeUrl, blob.type)
          ? new Blob([blob], { type: "application/pdf" })
          : blob;
        objectUrl = URL.createObjectURL(previewBlob);
        if (active) {
          setPreview({
            loading: false,
            url: objectUrl,
            type: previewBlob.type || "",
            error: "",
          });
        }
      } catch {
        if (active) {
          setPreview({
            loading: false,
            url: "",
            type: "",
            error: "Preview is not available for this resume.",
          });
        }
      }
    }

    loadResume();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [resumeUrl]);

  if (!resumeUrl) return null;

  const canShowPdf = shouldTreatAsPdf(resumeUrl, preview.type) && !isOfficeDocument(resumeUrl, preview.type);
  const canShowImage = isImage(resumeUrl, preview.type);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur"
      onClick={onClose}
    >
      <GlassCard
        hover={false}
        className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden p-0"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <h3 className="text-xl font-black text-white">Resume Preview</h3>
          <div className="flex items-center gap-2">
            <a href={resumeUrl} target="_blank" rel="noreferrer">
              <GhostButton>
                <ExternalLink className="h-4 w-4" /> Open
              </GhostButton>
            </a>
            <button
              onClick={onClose}
              className="text-slate-400 transition hover:text-white"
              aria-label="Close resume preview"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        {preview.loading ? (
          <div className="grid h-[72vh] place-items-center bg-white text-sm font-semibold text-slate-700">
            Loading resume preview...
          </div>
        ) : preview.error ? (
          <div className="grid h-[72vh] place-items-center bg-white p-8 text-center">
            <div>
              <p className="font-bold text-slate-900">{preview.error}</p>
              <p className="mt-2 text-sm text-slate-600">
                Use Open to view the original file.
              </p>
            </div>
          </div>
        ) : canShowImage ? (
          <div className="max-h-[72vh] overflow-auto bg-white p-4">
            <img
              src={preview.url}
              alt="Resume preview"
              className="mx-auto min-h-[60vh] max-w-full bg-white object-contain"
            />
          </div>
        ) : canShowPdf ? (
          <iframe
            src={preview.url}
            className="h-[72vh] w-full border-0 bg-white"
            title="Resume Preview"
          />
        ) : (
          <div className="grid h-[72vh] place-items-center bg-white p-8 text-center">
            <div>
              <p className="font-bold text-slate-900">
                This file type cannot be previewed in the browser.
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Use Open to view the original file.
              </p>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
