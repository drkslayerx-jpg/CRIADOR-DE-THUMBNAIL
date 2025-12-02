import React, { ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AlertTriangle } from 'lucide-react';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // FIX: Refactored state initialization to use a class property. This modern approach correctly establishes the component's state, resolving errors where `this.state` and `this.props` were not recognized.
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center font-sans">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-wider">Sistema Interrompido</h1>
          <p className="text-slate-400 max-w-md mb-6 leading-relaxed">
            Ocorreu um erro inesperado ao carregar a aplicação. Tente recarregar a página.
          </p>
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 max-w-lg w-full overflow-auto mb-6 text-left">
            <code className="text-xs text-red-300 font-mono block whitespace-pre-wrap">
              {this.state.error?.message}
            </code>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-red-900/20 uppercase tracking-widest text-xs"
          >
            Reiniciar Sistema
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
