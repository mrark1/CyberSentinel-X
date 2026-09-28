import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useSecurityStore } from '../../store/useSecurityStore';
import {
  DemoProgressBar,
  DeceptionCalloutModal,
  CounterfactualDecisionModal,
  IncidentResolvedModal
} from '../../demo';
import { ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AppLayout: React.FC = () => {
  const { simulation } = useSecurityStore();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#06090f] text-slate-100 font-sans">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />

        {/* Persistent Demo Progress Bar & Controller (8 Defense Pipeline Stages) */}
        <DemoProgressBar />

        {/* Page Viewport */}
        <main className="flex-1 overflow-y-auto bg-[#070b14] p-5">
          <Outlet />
        </main>
      </div>

      {/* Flagship Demonstration Modals (Synchronized from Demo Controller) */}
      <DeceptionCalloutModal />
      <CounterfactualDecisionModal />
      <IncidentResolvedModal />
    </div>
  );
};
