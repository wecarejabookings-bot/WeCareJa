import React from 'react';
import UnifiedAuthPage from '../src/components/auth/UnifiedAuthPage';

export default function AuthRoute() {
  return (
    <UnifiedAuthPage 
      onComplete={() => {
        if (typeof window !== 'undefined') window.location.href = '/';
      }}
      onCancel={() => {
        if (typeof window !== 'undefined') window.location.href = '/';
      }}
    />
  );
}
