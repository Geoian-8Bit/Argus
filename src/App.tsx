import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { RequireAdmin } from '@/components/auth/RequireAdmin';
import { AppShell } from '@/components/layout/AppShell';
import { HomePage } from '@/pages/HomePage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ScanPage } from '@/pages/ScanPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { ProductNewPage } from '@/pages/ProductNewPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { UsersPage } from '@/pages/UsersPage';
import { LoginPage } from '@/pages/LoginPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { AuthCallbackPage } from '@/pages/AuthCallbackPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <AppShell>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/scan" element={<ScanPage />} />
                  <Route
                    path="/dashboard"
                    element={
                      <RequireAdmin>
                        <DashboardPage />
                      </RequireAdmin>
                    }
                  />
                  <Route
                    path="/products"
                    element={
                      <RequireAdmin>
                        <ProductsPage />
                      </RequireAdmin>
                    }
                  />
                  <Route
                    path="/products/new"
                    element={
                      <RequireAdmin>
                        <ProductNewPage />
                      </RequireAdmin>
                    }
                  />
                  <Route
                    path="/products/:id"
                    element={
                      <RequireAdmin>
                        <ProductDetailPage />
                      </RequireAdmin>
                    }
                  />
                  <Route
                    path="/history"
                    element={
                      <RequireAdmin>
                        <HistoryPage />
                      </RequireAdmin>
                    }
                  />
                  <Route
                    path="/users"
                    element={
                      <RequireAdmin>
                        <UsersPage />
                      </RequireAdmin>
                    }
                  />
                </Routes>
              </AppShell>
            </RequireAuth>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
