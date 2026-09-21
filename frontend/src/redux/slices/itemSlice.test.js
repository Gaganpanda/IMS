import { describe, it, expect } from "vitest";
import reducer, {
  setFilters,
  setPage,
  setPageSize,
  setActiveTab,
  resetFilters,
  clearSelectedItem,
  clearItemError,
  fetchItemsAsync,
  fetchItemByIdAsync,
  createItemAsync,
} from "./itemSlice";

const initialState = reducer(undefined, { type: "@@INIT" });

describe("itemSlice plain reducers", () => {
  it("setFilters merges into existing filters and resets to page 0", () => {
    const state = {
      ...initialState,
      pagination: { ...initialState.pagination, page: 3 },
    };
    const next = reducer(state, setFilters({ category: "Electronics" }));
    expect(next.filters.category).toBe("Electronics");
    // untouched filter fields survive the merge
    expect(next.filters.sortBy).toBe("updatedAt");
    expect(next.pagination.page).toBe(0);
  });

  it("setPage updates only the page number", () => {
    const next = reducer(initialState, setPage(2));
    expect(next.pagination.page).toBe(2);
    expect(next.pagination.size).toBe(initialState.pagination.size);
  });

  it("setPageSize updates size and resets to page 0", () => {
    const state = { ...initialState, pagination: { ...initialState.pagination, page: 5 } };
    const next = reducer(state, setPageSize(40));
    expect(next.pagination.size).toBe(40);
    expect(next.pagination.page).toBe(0);
  });

  it("setActiveTab updates the tab and resets to page 0", () => {
    const state = { ...initialState, pagination: { ...initialState.pagination, page: 4 } };
    const next = reducer(state, setActiveTab("developed"));
    expect(next.activeTab).toBe("developed");
    expect(next.pagination.page).toBe(0);
  });

  it("resetFilters restores defaults, page 0, and the 'all' tab", () => {
    const dirty = {
      ...initialState,
      filters: { ...initialState.filters, search: "torch", category: "Gear" },
      pagination: { ...initialState.pagination, page: 6 },
      activeTab: "iprFiled",
    };
    const next = reducer(dirty, resetFilters());
    expect(next.filters).toEqual(initialState.filters);
    expect(next.pagination.page).toBe(0);
    expect(next.activeTab).toBe("all");
  });

  it("clearSelectedItem nulls out selectedItem only", () => {
    const state = { ...initialState, selectedItem: { id: 1 }, error: "oops" };
    const next = reducer(state, clearSelectedItem());
    expect(next.selectedItem).toBeNull();
    expect(next.error).toBe("oops");
  });

  it("clearItemError nulls out error only", () => {
    const state = { ...initialState, error: "failed", selectedItem: { id: 1 } };
    const next = reducer(state, clearItemError());
    expect(next.error).toBeNull();
    expect(next.selectedItem).toEqual({ id: 1 });
  });
});

describe("itemSlice extraReducers", () => {
  it("fetchItemsAsync.pending sets listLoading and clears error", () => {
    const state = { ...initialState, error: "old" };
    const next = reducer(state, { type: fetchItemsAsync.pending.type });
    expect(next.listLoading).toBe(true);
    expect(next.error).toBeNull();
  });

  it("fetchItemsAsync.fulfilled stores list + pagination from a Spring Page payload", () => {
    const payload = {
      content: [{ id: 1, name: "Item A" }, { id: 2, name: "Item B" }],
      number: 1,
      size: 20,
      totalElements: 42,
      totalPages: 3,
    };
    const next = reducer(initialState, { type: fetchItemsAsync.fulfilled.type, payload });
    expect(next.listLoading).toBe(false);
    expect(next.list).toHaveLength(2);
    expect(next.pagination).toEqual({ page: 1, size: 20, totalElements: 42, totalPages: 3 });
  });

  it("fetchItemsAsync.rejected stores the error and clears loading", () => {
    const state = { ...initialState, listLoading: true };
    const next = reducer(state, { type: fetchItemsAsync.rejected.type, payload: "Failed to load items" });
    expect(next.listLoading).toBe(false);
    expect(next.error).toBe("Failed to load items");
  });

  it("fetchItemByIdAsync.fulfilled sets selectedItem and clears detailLoading", () => {
    const state = { ...initialState, detailLoading: true };
    const next = reducer(state, {
      type: fetchItemByIdAsync.fulfilled.type,
      payload: { id: 9, name: "Night Vision Goggles" },
    });
    expect(next.detailLoading).toBe(false);
    expect(next.selectedItem).toEqual({ id: 9, name: "Night Vision Goggles" });
  });

  it("createItemAsync.pending sets submitting and clears error", () => {
    const state = { ...initialState, error: "prior error" };
    const next = reducer(state, { type: createItemAsync.pending.type });
    expect(next.submitting).toBe(true);
    expect(next.error).toBeNull();
  });

  it("createItemAsync.rejected stores the error and clears submitting", () => {
    const state = { ...initialState, submitting: true };
    const next = reducer(state, { type: createItemAsync.rejected.type, payload: "Name already exists" });
    expect(next.submitting).toBe(false);
    expect(next.error).toBe("Name already exists");
  });
});
