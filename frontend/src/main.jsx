import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import store from "./redux/store";
import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./components/common/ErrorBoundary/ErrorBoundary";
import { ThemeProvider } from "./context/ThemeContext";

// Self-hosted fonts (bundled at build time via @fontsource) — previously
// loaded from fonts.googleapis.com at runtime, which meant the app's
// typography silently broke (fell back to system fonts) on any network
// with no internet access, e.g. an offline/air-gapped LAN deployment.
// Same three families + weights as before, now shipped inside the build.
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/600.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
    <ThemeProvider>
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: "10px",
              fontSize: "13.5px",
              fontWeight: "500",
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            },
            success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
            error:   { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
          }}
        />
      </BrowserRouter>
    </Provider>
    </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
