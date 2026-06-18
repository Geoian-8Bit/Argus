import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './theme/ThemeProvider';
import App from './App';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

function renderApp(initialPath: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <ThemeProvider>
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[initialPath]}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    </ThemeProvider>,
  );
}

describe('App', () => {
  it('redirige a /login cuando no hay sesión', async () => {
    renderApp('/');
    expect(await screen.findByRole('heading', { name: /argus/i })).toBeInTheDocument();
    expect(await screen.findByLabelText(/email/i)).toBeInTheDocument();
    expect(await screen.findByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });
});
