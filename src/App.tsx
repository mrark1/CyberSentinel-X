/**
 * CyberSentinel X - Evidence-First Autonomous Cyber Defense Platform
 * Root Router Configuration
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { AttackGraphPage } from './pages/AttackGraphPage';
import { CyberTwinPage } from './pages/CyberTwinPage';
import { DeceptionPage } from './pages/DeceptionPage';
import { SimulationsPage } from './pages/SimulationsPage';
import { AttackReplayPage } from './pages/AttackReplayPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="incidents" element={<IncidentsPage />} />
          <Route path="incidents/:id" element={<IncidentDetailPage />} />
          <Route path="attack-graph" element={<AttackGraphPage />} />
          <Route path="cyber-twin" element={<CyberTwinPage />} />
          <Route path="deception" element={<DeceptionPage />} />
          <Route path="simulations" element={<SimulationsPage />} />
          <Route path="attack-replay" element={<AttackReplayPage />} />
          <Route path="replay" element={<AttackReplayPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
