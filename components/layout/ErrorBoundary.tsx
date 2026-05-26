"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in Super Admin Portal:", error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Portal Error Encountered</h1>
            <p className="text-slate-500 text-sm mb-6">
              A runtime crash occurred in the application. The system has intercepted the failure safely.
            </p>
            {this.state.error && (
              <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100 text-left overflow-auto max-h-40 font-mono text-xs text-red-600">
                <p className="font-bold">{this.state.error.name}: {this.state.error.message}</p>
                <p className="mt-2 text-slate-400 whitespace-pre">{this.state.error.stack}</p>
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 h-12 bg-slate-900 text-white rounded-xl font-bold hover:opacity-90 shadow-lg shadow-slate-900/20 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
