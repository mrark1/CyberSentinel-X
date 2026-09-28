import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, ShieldCheck } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  componentName?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `[CyberSentinel X ErrorBoundary] Error in ${this.props.componentName || 'Component'}:`,
      error,
      errorInfo
    );
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      const name = this.props.componentName || 'VISUALIZATION SUBSYSTEM';
      const msg =
        this.props.fallbackMessage ||
        'Component rendering encountered an unexpected exception. Security state, active telemetry streams, and autonomous containment remain unaffected.';

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="p-5 rounded-lg bg-[#0c101d] border-2 border-amber-500/60 shadow-lg space-y-3 my-2"
        >
          <div className="flex items-center justify-between border-b border-amber-950/80 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded bg-amber-950/80 border border-amber-500/50 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  FAULT TOLERANCE GUARDRAIL
                </div>
                <h3 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2">
                  <span>COMPONENT DEGRADED:</span>
                  <span className="text-amber-300">{name}</span>
                </h3>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 font-bold uppercase">
              DEGRADED MODE
            </span>
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {msg}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SOC Security Core: ONLINE</span>
            </div>

            <button
              onClick={this.handleRetry}
              className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-amber-500/50 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>Retry Component</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
