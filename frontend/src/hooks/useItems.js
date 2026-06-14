import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchItemsAsync, fetchItemByIdAsync,
  setFilters, setPage, resetFilters, clearSelectedItem,
} from "../redux/slices/itemSlice";

/**
 * useItems — manages item list fetching, filtering and pagination
 */
export function useItems() {
  const dispatch = useDispatch();
  const { list, pagination, filters, activeTab, listLoading, error } =
    useSelector((s) => s.items);

  const load = useCallback(() => {
    dispatch(fetchItemsAsync({
      ...filters,
      page: pagination.page,
      size: pagination.size,
    }));
  }, [dispatch, filters, pagination.page, pagination.size]);

  useEffect(() => { load(); }, [load]);

  return {
    items:       list,
    pagination,
    filters,
    activeTab,
    loading:     listLoading,
    error,
    refresh:     load,
    setFilters:  (f) => dispatch(setFilters(f)),
    setPage:     (p) => dispatch(setPage(p)),
    resetFilters: () => dispatch(resetFilters()),
  };
}

/**
 * useItemDetail — fetches and returns a single item by id
 */
export function useItemDetail(id) {
  const dispatch = useDispatch();
  const { selectedItem, detailLoading, error } = useSelector((s) => s.items);

  useEffect(() => {
    if (id) dispatch(fetchItemByIdAsync(id));
    return () => dispatch(clearSelectedItem());
  }, [id, dispatch]);

  return { item: selectedItem, loading: detailLoading, error };
}
