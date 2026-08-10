import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notificationApi } from "../api/notificationApi";
import toast from "react-hot-toast";

/* ── Async thunks ── */
export const fetchNotificationsAsync = createAsyncThunk(
  "notifications/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await notificationApi.getAll();
      return res.data.data; // array of NotificationDTO.Response
    } catch (err) {
      return rejectWithValue(err.response?.data?.error);
    }
  }
);

export const markAsReadAsync = createAsyncThunk(
  "notifications/markAsRead",
  async (id, { rejectWithValue }) => {
    try {
      await notificationApi.markAsRead(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error);
    }
  }
);

export const markAllAsReadAsync = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await notificationApi.markAllAsRead();
    } catch (err) {
      return rejectWithValue(err.response?.data?.error);
    }
  }
);

export const deleteNotificationAsync = createAsyncThunk(
  "notifications/delete",
  async (id, { rejectWithValue }) => {
    try {
      await notificationApi.deleteOne(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error);
    }
  }
);

export const deleteAllNotificationsAsync = createAsyncThunk(
  "notifications/deleteAll",
  async (_, { rejectWithValue }) => {
    try {
      await notificationApi.deleteAll();
      toast.success("All notifications deleted.");
    } catch (err) {
      return rejectWithValue(err.response?.data?.error);
    }
  }
);

/* ── Slice ── */
const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    list:        [],
    unreadCount: 0,
    showPopup:   false,
    loading:     false,
    error:       null,
  },
  reducers: {
    toggleNotificationPopup(state) { state.showPopup = !state.showPopup; },
    openNotificationPopup(state)   { state.showPopup = true; },
    closeNotificationPopup(state)  { state.showPopup = false; },
    // Push real-time notification from WebSocket
    pushNotification(state, action) {
      state.list.unshift(action.payload);
      if (!action.payload.read) state.unreadCount += 1;
    },
    clearNotificationError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    /* fetchAll */
    builder
      .addCase(fetchNotificationsAsync.pending, (state) => { state.loading = true; })
      .addCase(fetchNotificationsAsync.fulfilled, (state, action) => {
        state.loading     = false;
        state.list        = action.payload || [];
        state.unreadCount = (action.payload || []).filter((n) => !n.read).length;
      })
      .addCase(fetchNotificationsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    /* markAsRead */
    builder.addCase(markAsReadAsync.fulfilled, (state, action) => {
      const n = state.list.find((n) => n.id === action.payload);
      if (n && !n.read) { n.read = true; state.unreadCount = Math.max(0, state.unreadCount - 1); }
    });

    /* markAllAsRead */
    builder.addCase(markAllAsReadAsync.fulfilled, (state) => {
      state.list.forEach((n) => { n.read = true; });
      state.unreadCount = 0;
    });

    /* delete one */
    builder.addCase(deleteNotificationAsync.fulfilled, (state, action) => {
      const n = state.list.find((n) => n.id === action.payload);
      if (n && !n.read) state.unreadCount = Math.max(0, state.unreadCount - 1);
      state.list = state.list.filter((n) => n.id !== action.payload);
    });

    /* delete all */
    builder.addCase(deleteAllNotificationsAsync.fulfilled, (state) => {
      state.list        = [];
      state.unreadCount = 0;
    });
  },
});

export const {
  toggleNotificationPopup, openNotificationPopup, closeNotificationPopup,
  pushNotification, clearNotificationError,
} = notificationSlice.actions;

export default notificationSlice.reducer;
