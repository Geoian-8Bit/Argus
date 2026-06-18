import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { AppShell } from '@/components/layout/AppShell';
import { HomePage } from '@/pages/HomePage';
import { ScanPage } from '@/pages/ScanPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { ProductNewPage } from '@/pages/ProductNewPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { AuthCallbackPage } from '@/pages/AuthCallbackPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
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
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/products/new" element={<ProductNewPage />} />
                  <Route path="/history" element={<HistoryPage />} />
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
