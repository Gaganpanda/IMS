import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "../api/authApi";

/* ── Async thunks ── */
export const loginAsync = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await authApi.login(credentials);
      localStorage.setItem("token", res.data.data.token);
      return res.data.data; // { token, tokenType, user }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Login failed. Please try again."
      );
    }
  }
);

export const fetchCurrentUserAsync = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await authApi.getCurrentUser();
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error);
    }
  }
);

export const logoutAsync = createAsyncThunk("auth/logout", async () => {
  try {
    await authApi.logout();
  } catch (_) {}
  localStorage.removeItem("token");
});

/* ── Slice ── */
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user:    null,
    token:   localStorage.getItem("token") || null,
    loading: false,
    error:   null,
  },
  reducers: {
    logout(state) {
      state.user  = null;
      state.token = null;
      localStorage.removeItem("token");
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.token   = action.payload.token;
        state.user    = action.payload.user;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    builder
      .addCase(fetchCurrentUserAsync.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(fetchCurrentUserAsync.rejected, (state) => {
        state.user  = null;
        state.token = null;
        localStorage.removeItem("token");
      });

    builder.addCase(logoutAsync.fulfilled, (state) => {
      state.user  = null;
      state.token = null;
    });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
