import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { itemApi } from "../api/itemApi";
import toast from "react-hot-toast";

/* ── Async thunks ── */
export const fetchItemsAsync = createAsyncThunk(
  "items/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const res = await itemApi.getAll(params);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch items");
    }
  }
);

export const fetchItemByIdAsync = createAsyncThunk(
  "items/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await itemApi.getById(id);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Item not found");
    }
  }
);

export const createItemAsync = createAsyncThunk(
  "items/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await itemApi.create(payload);
      toast.success("Item added successfully!");
      return res.data.data;
    } catch (err) {
      const response = err.response?.data;
      console.error("Create item error response:", response);
      if (response?.data && typeof response.data === "object") {
        const fieldErrors = Object.entries(response.data)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(", ");
        const message = fieldErrors || response.message || "Validation failed";
        toast.error(message);
        return rejectWithValue(message);
      }
      const message = response?.error || response?.message || "Failed to create item";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateItemAsync = createAsyncThunk(
  "items/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await itemApi.update(id, data);
      toast.success("Item updated successfully!");
      return res.data.data;
    } catch (err) {
      const response = err.response?.data;
      console.error("Update item error response:", response);
      if (response?.data && typeof response.data === "object") {
        const fieldErrors = Object.entries(response.data)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(", ");
        const message = fieldErrors || response.message || "Validation failed";
        toast.error(message);
        return rejectWithValue(message);
      }
      const message = response?.error || response?.message || "Failed to update item";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const uploadImageAsync = createAsyncThunk(
  "items/uploadImage",
  async ({ id, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await itemApi.uploadImage(id, formData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to upload image");
    }
  }
);

export const deleteItemAsync = createAsyncThunk(
  "items/delete",
  async (id, { rejectWithValue }) => {
    try {
      await itemApi.delete(id);
      toast.success("Item deleted.");
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to delete item");
    }
  }
);

/* ── Slice ── */
const itemSlice = createSlice({
  name: "items",
  initialState: {
    list: [],
    pagination: { page: 0, size: 6, totalElements: 0, totalPages: 0 },
    filters: {
      search: "", category: "",
      developmentStatus: "", totStatus: "",
      iprStatus: "", trialsStatus: "",
      sortBy: "updatedAt", sortDir: "desc",
    },
    activeTab:     "all",
    selectedItem:  null,
    listLoading:   false,
    detailLoading: false,
    submitting:    false,
    deleting:      false,
    error:         null,
  },
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 0;
    },
    setPage(state, action) {
      state.pagination.page = action.payload;
    },
    setPageSize(state, action) {
      state.pagination.size = action.payload;
      state.pagination.page = 0;
    },
    setActiveTab(state, action) {
      state.activeTab = action.payload;
      state.pagination.page = 0;
    },
    resetFilters(state) {
      state.filters = {
        search: "", category: "",
        developmentStatus: "", totStatus: "",
        iprStatus: "", trialsStatus: "",
        sortBy: "updatedAt", sortDir: "desc",
      };
      state.pagination.page = 0;
      state.activeTab = "all";
    },
    clearSelectedItem(state) { state.selectedItem = null; },
    clearItemError(state)    { state.error = null; },
  },
  extraReducers: (builder) => {
    /* fetchAll */
    builder
      .addCase(fetchItemsAsync.pending,   (state)         => { state.listLoading = true; state.error = null; })
      .addCase(fetchItemsAsync.fulfilled, (state, action) => {
        state.listLoading = false;
        state.list        = action.payload.content;
        state.pagination  = {
          page:          action.payload.number,
          size:          action.payload.size,
          totalElements: action.payload.totalElements,
          totalPages:    action.payload.totalPages,
        };
      })
      .addCase(fetchItemsAsync.rejected,  (state, action) => { state.listLoading = false; state.error = action.payload; });

    /* fetchById */
    builder
      .addCase(fetchItemByIdAsync.pending,   (state)         => { state.detailLoading = true; state.error = null; })
      .addCase(fetchItemByIdAsync.fulfilled, (state, action) => { state.detailLoading = false; state.selectedItem = action.payload; })
      .addCase(fetchItemByIdAsync.rejected,  (state, action) => { state.detailLoading = false; state.error = action.payload; });

    /* create */
    builder
      .addCase(createItemAsync.pending,   (state)         => { state.submitting = true; state.error = null; })
      .addCase(createItemAsync.fulfilled, (state, action) => {
        state.submitting = false;
        state.list.unshift(action.payload);
        state.pagination.totalElements += 1;
      })
      .addCase(createItemAsync.rejected,  (state, action) => { state.submitting = false; state.error = action.payload; });

    /* update */
    builder
      .addCase(updateItemAsync.pending,   (state)         => { state.submitting = true; state.error = null; })
      .addCase(updateItemAsync.fulfilled, (state, action) => {
        state.submitting = false;
        const idx = state.list.findIndex((i) => i.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
        if (state.selectedItem?.id === action.payload.id) state.selectedItem = action.payload;
      })
      .addCase(updateItemAsync.rejected,  (state, action) => { state.submitting = false; state.error = action.payload; });

    /* uploadImage */
    builder
      .addCase(uploadImageAsync.fulfilled, (state, action) => {
        if (state.selectedItem?.id === action.payload.id) state.selectedItem = action.payload;
        const idx = state.list.findIndex((i) => i.id === action.payload.id);
        if (idx !== -1) state.list[idx] = { ...state.list[idx], imageUrl: action.payload.imageUrl };
      });

    /* delete */
    builder
      .addCase(deleteItemAsync.pending,   (state)         => { state.deleting = true; })
      .addCase(deleteItemAsync.fulfilled, (state, action) => {
        state.deleting = false;
        state.list     = state.list.filter((i) => i.id !== action.payload);
        state.pagination.totalElements = Math.max(0, state.pagination.totalElements - 1);
        if (state.selectedItem?.id === action.payload) state.selectedItem = null;
      })
      .addCase(deleteItemAsync.rejected,  (state, action) => { state.deleting = false; state.error = action.payload; });
  },
});

export const {
  setFilters, setPage, setPageSize, setActiveTab,
  resetFilters, clearSelectedItem, clearItemError,
} = itemSlice.actions;

export default itemSlice.reducer;
