import { apiFetch } from "./client";

export const kitsApi = {
  list: () => apiFetch("/api/kits"),
  create: (jd, companyUrl, days) =>
    apiFetch("/api/kits", { method: "POST", body: { jd, companyUrl, days } }),
  get: (id) => apiFetch(`/api/kits/${id}`),
  update: (id, patch) => apiFetch(`/api/kits/${id}`, { method: "PATCH", body: patch }),
  remove: (id) => apiFetch(`/api/kits/${id}`, { method: "DELETE" }),
  generate: (id) => apiFetch(`/api/kits/${id}/generate`, { method: "POST" }),
  regenerate: (id, section, category) =>
  apiFetch(`/api/kits/${id}/regenerate`, { method: "POST", body: { section, category } }),
  createBulk: (entries) => apiFetch("/api/kits/bulk", { method: "POST", body: { entries } }),
};







