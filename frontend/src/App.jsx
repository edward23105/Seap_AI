// src/App.jsx
// http://localhost:3000

import {React, useEffect, useState, createContext} from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import FrontPage from "./FrontPage";
import LoginPage from "./LoginPage";
import ReportsPage from "./ReportsPage";
import DashboardPage from "./DashboardPage";
import { getLoggedStatus } from "./api";
import ProtectedPage from "./ProtectedPage";

export default function App() {

  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<FrontPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reports" element={
            <ProtectedPage>
            <ReportsPage />
            </ProtectedPage>
          } />
          <Route path="/dashboardpage" element={
            <ProtectedPage>
            <DashboardPage />
          </ProtectedPage>
          } />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}
