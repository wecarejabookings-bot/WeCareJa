import React from 'react';
import AdminUserManagementPage from '../src/components/admin/AdminUserManagementPage';

export default function AdminUsersRoute() {
  return (
    <div className="min-h-screen bg-[#070314] text-white p-4 sm:p-8">
      <AdminUserManagementPage 
        onBackToPortal={() => {
          if (typeof window !== 'undefined') window.location.href = '/';
        }} 
      />
    </div>
  );
}
