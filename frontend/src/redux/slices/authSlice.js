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
      // Include the HTTP status (when there is one) so the reducer can tell
      // a real "unauthenticated" response (401/403) apart from a network
      // error / timeout / cancelled request, which has no err.response at
      // all and should NOT log the user out — see the rejected case below.
      return rejectWithValue({
        message: err.response?.data?.error,
        status: err.response?.status,
      });
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
      // FIX: this used to clear the token/user on ANY rejection of
      // /auth/me — including plain network errors, timeouts, or a request
      // that got cancelled because the tab was closing. That meant a
      // perfectly valid, unexpired token in localStorage could get wiped
      // out by a transient failure (e.g. the backend not answering fast
      // enough right as the app remounts after reopening a closed tab),
      // silently bouncing a still-logged-in user back to the login page.
      // Only a real "you are not authenticated" response (401/403) should
      // end the session; anything else (no response at all, 5xx, etc.)
      // just leaves the existing token in place so the next request can
      // retry.
      .addCase(fetchCurrentUserAsync.rejected, (state, action) => {
        const status = action.payload?.status;
        if (status === 401 || status === 403) {
          state.user  = null;
          state.token = null;
          localStorage.removeItem("token");
        }
      });

    builder.addCase(logoutAsync.fulfilled, (state) => {
      state.user  = null;
      state.token = null;
    });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
