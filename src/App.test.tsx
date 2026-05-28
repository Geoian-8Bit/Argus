import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

function renderApp() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('App', () => {
  it('renderiza la cabecera y los botones de acción', () => {
    renderApp();
    expect(screen.getByRole('heading', { name: /qr stock/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /añadir/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /retirar/i })).toBeInTheDocument();
  });
});
