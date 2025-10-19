import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./theme/ThemeProvider.jsx";
import App from "./App.jsx";
import "./styles.css";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { FavoritesProvider } from "./context/FavoritesContext.jsx";


createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <FavoritesProvider>
        <ThemeProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </FavoritesProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
