/**
 * itemApi.js
 * Low-level API calls for items.
 * Used by itemSlice thunks (delegates to itemService for param building).
 */
import axiosInstance from "../../services/axiosInstance";

const BASE = "/items";

function buildParams({ page = 0, size = 6, sortBy = "updatedAt", sortDir = "desc", ...filters }) {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("size", size);
  params.set("sort", `${sortBy},${sortDir}`);
  if (filters.search)            params.set("search",            filters.search);
  if (filters.category)          params.set("category",          filters.category);
  if (filters.developmentStatus) params.set("developmentStatus", filters.developmentStatus);
  if (filters.totStatus)         params.set("totStatus",         filters.totStatus);
  if (filters.iprStatus)         params.set("iprStatus",         filters.iprStatus);
  if (filters.trialsStatus)      params.set("trialsStatus",      filters.trialsStatus);
  return params;
}

export const itemApi = {
  getAll:      (params) => axiosInstance.get(BASE, { params: buildParams(params || {}) }),
  getById:     (id)     => axiosInstance.get(`${BASE}/${id}`),
  create:      (data)   => axiosInstance.post(BASE, data),
  update:      (id, data) => axiosInstance.put(`${BASE}/${id}`, data),
  delete:      (id)     => axiosInstance.delete(`${BASE}/${id}`),
  uploadImage: (id, formData) =>
    axiosInstance.post(`${BASE}/${id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
