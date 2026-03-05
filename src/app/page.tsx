"use client";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { DataProvider } from "@/contexts/DataContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import LoginPage from "@/components/LoginPage";
import MainApp from "@/components/MainApp";

function AppContent() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <MainApp /> : <LoginPage />;
}

export default function Home() {
  return (
    <ToastProvider>
      <AuthProvider>
        <DataProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </DataProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
