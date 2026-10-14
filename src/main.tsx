import { Component, ErrorInfo, ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log("App loaded");

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[WeCare App Error Boundary caught error]:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0E061A] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#1A0B2E] border border-purple-500/30 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-purple-600/20 text-[#C77DFF] flex items-center justify-center mx-auto text-2xl font-bold">
              ⚕️
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">We Care Jamaica</h1>
            <p className="text-sm text-slate-300">
              The application encountered a display refresh issue. All patient records and booking states remain secure.
            </p>
            {this.state.error && (
              <pre className="text-left text-[11px] p-3 rounded-xl bg-black/50 text-amber-300 overflow-x-auto border border-white/10 font-mono">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => {
                  window.location.href = '/';
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] text-white font-bold text-sm hover:opacity-95 transition cursor-pointer shadow-lg"
              >
                Reload Home
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('wecare_current_user_id');
                    sessionStorage.removeItem('wecare_session_user_id');
                  } catch {}
                  window.location.reload();
                }}
                className="px-5 py-2.5 rounded-xl bg-white/10 text-slate-300 font-bold text-sm hover:bg-white/20 transition cursor-pointer"
              >
                Reset Session
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
);
