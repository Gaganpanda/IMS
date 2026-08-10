import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import itemReducer from "./slices/itemSlice";
import dashboardReducer from "./slices/dashboardSlice";
import notificationReducer from "./slices/notificationSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    items: itemReducer,
    dashboard: dashboardReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types (dates can be non-serializable from API)
        ignoredActions: [
          "items/fetchAll/fulfilled",
          "dashboard/fetchStats/fulfilled",
        ],
      },
    }),
  devTools: import.meta.env.DEV,
});

export default store;
