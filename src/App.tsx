import { Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { HomePage } from '@/pages/HomePage';
import { ScanPage } from '@/pages/ScanPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { HistoryPage } from '@/pages/HistoryPage';

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </AppShell>
  );
}

export default App;
