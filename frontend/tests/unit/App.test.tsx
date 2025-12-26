import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import koKR from 'antd/locale/ko_KR';
import { DashboardPage } from '@/presentation/pages/dashboard';

// Test wrapper with providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={koKR}>
        <MemoryRouter>{children}</MemoryRouter>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

describe('App', () => {
  it('renders DashboardPage successfully', () => {
    render(<DashboardPage />, { wrapper: createWrapper() });
    expect(screen.getByText('대시보드')).toBeInTheDocument();
  });

  it('displays summary cards', () => {
    render(<DashboardPage />, { wrapper: createWrapper() });
    expect(screen.getByText('이번 달 변경 건수')).toBeInTheDocument();
    expect(screen.getByText('정산 대기 건')).toBeInTheDocument();
    expect(screen.getByText('총 정산 금액')).toBeInTheDocument();
  });
});
