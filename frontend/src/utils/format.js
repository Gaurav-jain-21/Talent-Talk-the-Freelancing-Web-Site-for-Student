export function initials(value = "") {
  const parts = String(value).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "TT";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function asArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.applications)) return value.applications;
  if (Array.isArray(value?.jobs)) return value.jobs;
  if (Array.isArray(value?.students)) return value.students;
  if (Array.isArray(value?.interviews)) return value.interviews;
  if (Array.isArray(value?.messages)) return value.messages;
  return [];
}

export function pick(object, keys, fallback = "") {
  for (const key of keys) {
    const value = object?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return fallback;
}

export function formatDate(value) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function daysUntil(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.ceil((date.getTime() - Date.now()) / 86400000);
}

export function errorMessage(error) {
  if (typeof error?.response?.data === "string") return error.response.data;
  if (error?.code === "ECONNABORTED") return "Backend service timed out. Please try again.";
  if (error?.message === "Network Error") return "Backend service is not reachable from the frontend.";
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong"
  );
}

export function routeForRole(role) {
  const normalized = String(role || "").toUpperCase();
  if (normalized === "COMPANY") return "/company/dashboard";
  if (normalized === "ADMIN") return "/admin/dashboard";
  return "/student/dashboard";
}

export function statusTone(status = "") {
  const normalized = String(status).toUpperCase();
  if (["SELECTED", "RECOMMENDED", "ACTIVE", "APPROVED"].includes(normalized)) return "green";
  if (["REJECTED", "CLOSED", "FAILED"].includes(normalized)) return "red";
  if (["PENDING", "SCHEDULED"].includes(normalized)) return "yellow";
  if (["WITHDRAWN"].includes(normalized)) return "slate";
  return "indigo";
}

export function progressForStatus(status = "") {
  const normalized = String(status).toUpperCase();
  if (normalized === "PENDING") return 25;
  if (normalized === "WITHDRAWN") return 50;
  if (["SELECTED", "REJECTED"].includes(normalized)) return 100;
  return 15;
}
