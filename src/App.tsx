import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { RequireAdmin } from '@/components/auth/RequireAdmin';
import { AppShell } from '@/components/layout/AppShell';
import { WarehouseProvider } from '@/features/warehouses/WarehouseProvider';
import { HomePage } from '@/pages/HomePage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ScanPage } from '@/pages/ScanPage';
import { MovementPage } from '@/pages/MovementPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { ProductNewPage } from '@/pages/ProductNewPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { UsersPage } from '@/pages/UsersPage';
import { WarehousesPage } from '@/pages/WarehousesPage';
import { ChecklistPage } from '@/pages/ChecklistPage';
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
              <WarehouseProvider>
                <AppShell>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/scan" element={<ScanPage />} />
                    {/* Movimiento a mano, sin escanear: lo usan los comerciales. */}
                    <Route path="/movement" element={<MovementPage />} />
                    <Route path="/checklist" element={<ChecklistPage />} />
                    {/* El panel se auto-restringe: staff solo ve sus revisiones. */}
                    <Route path="/dashboard" element={<DashboardPage />} />
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
                    {/* Historial visible para admin y staff. */}
                    <Route path="/history" element={<HistoryPage />} />
                    <Route
                      path="/users"
                      element={
                        <RequireAdmin>
                          <UsersPage />
                        </RequireAdmin>
                      }
                    />
                    <Route
                      path="/warehouses"
                      element={
                        <RequireAdmin>
                          <WarehousesPage />
                        </RequireAdmin>
                      }
                    />
                  </Routes>
                </AppShell>
              </WarehouseProvider>
            </RequireAuth>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
