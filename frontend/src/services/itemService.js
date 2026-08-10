import axiosInstance from "./axiosInstance";

const BASE = "/items";

/**
 * Build query params from filter + pagination state
 * Matches Spring Pageable + custom filter params
 */
function buildParams({ page = 0, size = 6, sortBy = "updatedAt", sortDir = "desc", ...filters }) {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("size", size);
  params.set("sort", `${sortBy},${sortDir}`);

  if (filters.search)            params.set("search", filters.search);
  if (filters.category)          params.set("category", filters.category);
  if (filters.developmentStatus) params.set("developmentStatus", filters.developmentStatus);
  if (filters.totStatus)         params.set("totStatus", filters.totStatus);
  if (filters.iprStatus)         params.set("iprStatus", filters.iprStatus);
  if (filters.trialsStatus)      params.set("trialsStatus", filters.trialsStatus);

  return params;
}

/* ── CRUD ── */

export const getAllItems = (params) =>
  axiosInstance.get(BASE, { params: buildParams(params || {}) });

export const getItemById = (id) =>
  axiosInstance.get(`${BASE}/${id}`);

export const createItem = (data) =>
  axiosInstance.post(BASE, data);

export const updateItem = (id, data) =>
  axiosInstance.put(`${BASE}/${id}`, data);

export const deleteItem = (id) =>
  axiosInstance.delete(`${BASE}/${id}`);

/* ── Extra endpoints ── */

export const getItemHistory = (id) =>
  axiosInstance.get(`${BASE}/${id}/history`);

export const uploadItemImage = (id, formData) =>
  axiosInstance.post(`${BASE}/${id}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getItemsByStatus = (status) =>
  axiosInstance.get(BASE, { params: buildParams({ developmentStatus: status, size: 100 }) });
