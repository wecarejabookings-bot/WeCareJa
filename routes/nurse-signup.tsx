import React from 'react';
import NurseOnboardingForm from '../src/components/nurse/NurseOnboardingForm';

export default function NurseSignupRoute() { 
  return (
    <NurseOnboardingForm 
      onComplete={() => {
        if (typeof window !== 'undefined') window.location.href = '/';
      }} 
      onCancel={() => {
        if (typeof window !== 'undefined') window.location.href = '/';
      }}
      onNavigateHome={() => {
        if (typeof window !== 'undefined') window.location.href = '/';
      }}
    />
  );
}
