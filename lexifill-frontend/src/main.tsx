import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import UploadPage from "./pages/UploadPage"
import FillPage from "./pages/FillPage";
import PreviewPage from "./pages/PreviewPage";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<UploadPage />} />
          <Route path="fill" element={<FillPage />} />
          <Route path="preview" element={<PreviewPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
