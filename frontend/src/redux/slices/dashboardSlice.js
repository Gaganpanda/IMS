import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dashboardApi } from "../api/dashboardApi";

/* ── Async thunks ── */
export const fetchDashboardStatsAsync = createAsyncThunk(
  "dashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await dashboardApi.getStats();
      return res.data.data; // full DashboardStats object
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to load dashboard");
    }
  }
);

export const fetchUpcomingDueDatesAsync = createAsyncThunk(
  "dashboard/fetchUpcomingDueDates",
  async (_, { rejectWithValue }) => {
    try {
      const res = await dashboardApi.getUpcomingDates();
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error);
    }
  }
);

export const fetchMonthlyProgressAsync = createAsyncThunk(
  "dashboard/fetchMonthlyProgress",
  async (year = new Date().getFullYear(), { rejectWithValue }) => {
    try {
      const res = await dashboardApi.getMonthlyProgress(year);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error);
    }
  }
);

/* ── Slice ── */
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    stats:              null,
    upcomingDueDates:   [],
    monthlyProgress:    [],
    trialsOverview:     [],
    documentationStats: null,
    recentActivities:   [],
    loading:            false,
    error:              null,
  },
  reducers: {
    clearDashboardError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    /* fetchStats — unpacks the full DashboardStats into the slice */
    builder
      .addCase(fetchDashboardStatsAsync.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchDashboardStatsAsync.fulfilled, (state, action) => {
        state.loading           = false;
        const d                 = action.payload;
        // Top-level counters / percentages live directly on d
        state.stats             = d;
        state.trialsOverview    = d.trialsOverview    || [];
        state.monthlyProgress   = d.monthlyProgress   || [];
        state.documentationStats= d.documentationStats || null;
        state.upcomingDueDates  = d.upcomingDueDates  || [];
        state.recentActivities  = d.recentActivities  || [];
      })
      .addCase(fetchDashboardStatsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    builder.addCase(fetchUpcomingDueDatesAsync.fulfilled, (state, action) => {
      state.upcomingDueDates = action.payload || [];
    });

    builder.addCase(fetchMonthlyProgressAsync.fulfilled, (state, action) => {
      state.monthlyProgress = action.payload || [];
    });
  },
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
