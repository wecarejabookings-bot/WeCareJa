import React, { useEffect } from 'react';

export default function ClientSignupRoute() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.replace('/auth?mode=signup&role=client');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#070314] text-white flex items-center justify-center p-4">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-300">Redirecting to family registration...</p>
      </div>
    </div>
  );
}
