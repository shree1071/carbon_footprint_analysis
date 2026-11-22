import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';

// Pages
import { CampusCalculatorPage } from '../pages/calculator/CampusCalculatorPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { AnalyticsPage } from '../pages/analytics/AnalyticsPage';
import { ElectricityDataPage } from '../pages/data/ElectricityDataPage';
import { ReportsPage } from '../pages/reports/ReportsPage';
import { RecommendationsPage } from '../pages/recommendations/RecommendationsPage';
import { SimulationPage } from '../pages/simulation/SimulationPage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        {/* Core Campus Carbon Calculator (Landing Page) */}
        <Route index element={<CampusCalculatorPage />} />

        {/* Supporting Modules */}
        <Route path="calculator" element={<CampusCalculatorPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="telemetry" element={<DashboardPage />} />
        <Route path="electricity" element={<ElectricityDataPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="recommendations" element={<RecommendationsPage />} />
        <Route path="simulation" element={<SimulationPage />} />
      </Route>

      {/* Redirect login directly to the open calculator platform */}
      <Route path="/login" element={<Navigate to="/" replace />} />

      {/* Catch-all redirect to Calculator */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
