import { useEffect, useState } from "react";
import { ExternalLink, FileText, X } from "lucide-react";
import { studentApi } from "../api/services";
import { GhostButton, GlassCard } from "./ui/Primitives";

export default function ResumePreviewModal({ userId, sourceUrl = "", onClose }) {
  const [preview, setPreview] = useState({
    loading: true,
    url: "",
    type: "",
    error: "",
  });

  useEffect(() => {
    let objectUrl = "";
    let cancelled = false;

    async function loadResume() {
      setPreview({ loading: true, url: "", type: "", error: "" });
      try {
        const response = await studentApi.resumePreview(userId);
        const contentType = await detectBlobType(
          response.data,
          response.headers?.["content-type"] || "",
        );
        const previewBlob = new Blob([response.data], { type: contentType });
        objectUrl = URL.createObjectURL(previewBlob);
        if (cancelled) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        setPreview({
          loading: false,
          url: objectUrl,
          type: contentType,
          error: "",
        });
      } catch (error) {
        if (!cancelled) {
          setPreview({
            loading: false,
            url: "",
            type: "",
            error: error?.response?.data || "Resume preview is not available.",
          });
        }
      }
    }

    loadResume();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [userId]);

  const isImage = preview.type.startsWith("image/");
  const canInline = isImage || preview.type.includes("pdf");
  const officePreviewUrl =
    sourceUrl && isOfficeDocument(preview.type, sourceUrl)
      ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(sourceUrl)}`
      : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur"
      onClick={onClose}
    >
      <GlassCard
        hover={false}
        className="relative max-h-[92vh] w-full max-w-5xl overflow-hidden p-0"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <div>
            <h3 className="text-xl font-black text-white">Resume Preview</h3>
            <p className="mt-1 text-sm text-slate-500">
              Loaded securely through Talent Talk.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white"
            aria-label="Close resume preview"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="grid min-h-[66vh] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
            {preview.loading ? (
              <div className="grid place-items-center text-sm font-bold text-slate-400">
                Loading resume...
              </div>
            ) : preview.error ? (
              <div className="grid place-items-center p-8 text-center">
                <FileText className="mx-auto mb-4 h-10 w-10 text-amber-100" />
                <p className="font-bold text-white">Unable to preview resume</p>
                <p className="mt-2 max-w-md text-sm text-slate-400">
                  {preview.error}
                </p>
              </div>
            ) : isImage ? (
              <img
                src={preview.url}
                alt="Resume preview"
                className="max-h-[66vh] w-full object-contain"
              />
            ) : canInline ? (
              <iframe
                src={preview.url}
                className="h-[66vh] w-full border-0"
                title="Resume Preview"
              />
            ) : officePreviewUrl ? (
              <iframe
                src={officePreviewUrl}
                className="h-[66vh] w-full border-0"
                title="Resume Preview"
              />
            ) : (
              <div className="grid place-items-center p-8 text-center">
                <FileText className="mx-auto mb-4 h-10 w-10 text-cyan-100" />
                <p className="font-bold text-white">This resume format cannot be previewed inline.</p>
                <p className="mt-2 max-w-md text-sm text-slate-400">
                  Uploading the resume as a PDF will show it directly inside this panel.
                </p>
              </div>
            )}
          </div>

          {preview.url && (
            <a href={preview.url} target="_blank" rel="noreferrer">
              <GhostButton>
                <ExternalLink className="h-4 w-4" />
                Open resume in new tab
              </GhostButton>
            </a>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

async function detectBlobType(blob, fallbackType = "") {
  const normalizedFallback = fallbackType.toLowerCase();
  if (normalizedFallback.includes("pdf")) return "application/pdf";
  if (normalizedFallback.startsWith("image/")) return normalizedFallback;

  const bytes = new Uint8Array(await blob.slice(0, 16).arrayBuffer());
  if (matches(bytes, [0x25, 0x50, 0x44, 0x46])) return "application/pdf";
  if (matches(bytes, [0x89, 0x50, 0x4e, 0x47])) return "image/png";
  if (matches(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (
    matches(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    matches(bytes.slice(8), [0x57, 0x45, 0x42, 0x50])
  ) {
    return "image/webp";
  }
  return normalizedFallback || blob.type || "application/octet-stream";
}

function matches(bytes, signature) {
  if (bytes.length < signature.length) return false;
  return signature.every((value, index) => bytes[index] === value);
}

function isOfficeDocument(contentType = "", url = "") {
  const normalizedType = contentType.toLowerCase();
  const normalizedUrl = url.toLowerCase().split("?")[0];
  return (
    normalizedType.includes("word") ||
    normalizedType.includes("officedocument") ||
    normalizedUrl.endsWith(".doc") ||
    normalizedUrl.endsWith(".docx")
  );
}
