/**
 * TopNavigation Component Tests
 * 
 * Test coverage for TopNavigation component with useNotifications hook integration.
 * 
 * Coverage:
 * - Badge display from hook data
 * - Bell click navigation with filters
 * - Refresh button functionality
 * - Loading states display
 * - Error handling
 * - Accessibility labels
 * 
 * @framework Jest + React Testing Library
 * @language TypeScript
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TopNavigation } from '@/components/profile/TopNavigation';
import { useNotifications } from '@/hooks/useNotifications';
import { useRouter } from 'next/navigation';

// Mock the hooks
jest.mock('@/hooks/useNotifications');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUseNotifications = useNotifications as jest.MockedFunction<typeof useNotifications>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('TopNavigation Component', () => {
  const mockPush = jest.fn();
  const mockMutate = jest.fn();

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup router mock
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    } as any);

    // Setup default useNotifications mock
    mockUseNotifications.mockReturnValue({
      badgeCount: 0,
      breakdown: { pending: 0, overdue: 0 },
      isLoading: false,
      error: null,
      mutate: mockMutate,
    });
  });

  describe('Basic Rendering', () => {
    it('renders brand name with link to profile', () => {
      render(<TopNavigation />);
      
      const brandLink = screen.getByRole('link', { name: /กลับไปหน้าโปรไฟล์/i });
      expect(brandLink).toBeInTheDocument();
      expect(brandLink).toHaveTextContent('ระบบ ID-Trace');
      expect(brandLink).toHaveAttribute('href', '/profile');
    });

    it('renders bell icon', () => {
      render(<TopNavigation />);
      
      const bellButton = screen.getByRole('button', { name: /ไม่มีการแจ้งเตือน/i });
      expect(bellButton).toBeInTheDocument();
    });

    it('renders refresh button', () => {
      render(<TopNavigation />);
      
      const refreshButton = screen.getByRole('button', { name: /รีเฟรชการแจ้งเตือน/i });
      expect(refreshButton).toBeInTheDocument();
    });

    it('renders logo', () => {
      render(<TopNavigation />);
      
      const logo = screen.getByAltText('JAOTHUI Logo');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', '/thuiLogo.png');
    });
  });

  describe('Badge Display', () => {
    it('displays badge count when notifications exist', () => {
      mockUseNotifications.mockReturnValue({
        badgeCount: 5,
        breakdown: { pending: 3, overdue: 2 },
        isLoading: false,
        error: null,
        mutate: mockMutate,
      });

      render(<TopNavigation />);
      
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('displays "99+" when badge count exceeds 99', () => {
      mockUseNotifications.mockReturnValue({
        badgeCount: 150,
        breakdown: { pending: 100, overdue: 50 },
        isLoading: false,
        error: null,
        mutate: mockMutate,
      });

      render(<TopNavigation />);
      
      expect(screen.getByText('99+')).toBeInTheDocument();
    });

    it('does not display badge when count is 0', () => {
      mockUseNotifications.mockReturnValue({
        badgeCount: 0,
        breakdown: { pending: 0, overdue: 0 },
        isLoading: false,
        error: null,
        mutate: mockMutate,
      });

      render(<TopNavigation />);
      
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('includes breakdown in aria-label', () => {
      mockUseNotifications.mockReturnValue({
        badgeCount: 5,
        breakdown: { pending: 3, overdue: 2 },
        isLoading: false,
        error: null,
        mutate: mockMutate,
      });

      render(<TopNavigation />);
      
      const bellButton = screen.getByRole('button', { name: /5 รายการ.*3 รอดำเนินการ.*2 เกินกำหนด/i });
      expect(bellButton).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('displays spinner when loading', () => {
      mockUseNotifications.mockReturnValue({
        badgeCount: 0,
        breakdown: { pending: 0, overdue: 0 },
        isLoading: true,
        error: null,
        mutate: mockMutate,
      });

      render(<TopNavigation />);
      
      // Bell button should be disabled
      const bellButton = screen.getByRole('button', { name: /ไม่มีการแจ้งเตือน/i });
      expect(bellButton).toBeDisabled();
    });

    it('hides badge when loading', () => {
      mockUseNotifications.mockReturnValue({
        badgeCount: 5,
        breakdown: { pending: 3, overdue: 2 },
        isLoading: true,
        error: null,
        mutate: mockMutate,
      });

      render(<TopNavigation />);
      
      expect(screen.queryByText('5')).not.toBeInTheDocument();
    });
  });

  describe('Bell Click Navigation', () => {
    it('navigates to activities with filters on bell click', async () => {
      const user = userEvent.setup();
      
      mockUseNotifications.mockReturnValue({
        badgeCount: 5,
        breakdown: { pending: 3, overdue: 2 },
        isLoading: false,
        error: null,
        mutate: mockMutate,
      });

      render(<TopNavigation />);
      
      const bellButton = screen.getByRole('button', { name: /5 รายการ/i });
      await user.click(bellButton);
      
      expect(mockPush).toHaveBeenCalledWith('/animals?tab=activities&status=pending,overdue');
    });

    it('does not navigate when bell is loading', async () => {
      const user = userEvent.setup();
      
      mockUseNotifications.mockReturnValue({
        badgeCount: 0,
        breakdown: { pending: 0, overdue: 0 },
        isLoading: true,
        error: null,
        mutate: mockMutate,
      });

      render(<TopNavigation />);
      
      const bellButton = screen.getByRole('button', { name: /ไม่มีการแจ้งเตือน/i });
      expect(bellButton).toBeDisabled();
      
      // Click should not work
      await user.click(bellButton);
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Refresh Button', () => {
    it('calls mutate when refresh button is clicked', async () => {
      const user = userEvent.setup();
      
      mockMutate.mockResolvedValue(undefined);

      render(<TopNavigation />);
      
      const refreshButton = screen.getByRole('button', { name: /รีเฟรชการแจ้งเตือน/i });
      await user.click(refreshButton);
      
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
      });
    });

    it('disables refresh button during loading', () => {
      mockUseNotifications.mockReturnValue({
        badgeCount: 0,
        breakdown: { pending: 0, overdue: 0 },
        isLoading: true,
        error: null,
        mutate: mockMutate,
      });

      render(<TopNavigation />);
      
      const refreshButton = screen.getByRole('button', { name: /รีเฟรชการแจ้งเตือน/i });
      expect(refreshButton).toBeDisabled();
    });

    it('handles refresh errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockMutate.mockRejectedValue(new Error('Refresh failed'));

      render(<TopNavigation />);
      
      const refreshButton = screen.getByRole('button', { name: /รีเฟรชการแจ้งเตือน/i });
      await user.click(refreshButton);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to refresh notifications:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('logs errors in development mode', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const mockError = new Error('Test error');
      mockUseNotifications.mockReturnValue({
        badgeCount: 0,
        breakdown: { pending: 0, overdue: 0 },
        isLoading: false,
        error: mockError,
        mutate: mockMutate,
      });

      render(<TopNavigation />);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Notification error:', mockError);

      consoleErrorSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for all interactive elements', () => {
      render(<TopNavigation />);
      
      expect(screen.getByRole('navigation', { name: /หน้าหลัก/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/กลับไปหน้าโปรไฟล์/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/ไม่มีการแจ้งเตือน/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/รีเฟรชการแจ้งเตือน/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/โลโก้ JAOTHUI/i)).toBeInTheDocument();
    });

    it('has minimum 44px touch targets', () => {
      render(<TopNavigation />);
      
      const bellButton = screen.getByRole('button', { name: /ไม่มีการแจ้งเตือน/i });
      const refreshButton = screen.getByRole('button', { name: /รีเฟรชการแจ้งเตือน/i });
      
      // Check if buttons have minimum size classes
      expect(bellButton).toHaveClass('min-h-[44px]');
      expect(bellButton).toHaveClass('min-w-[44px]');
      expect(refreshButton).toHaveClass('min-h-[44px]');
      expect(refreshButton).toHaveClass('min-w-[44px]');
    });
  });

  describe('Callbacks', () => {
    it('calls onBrandClick when brand is clicked', async () => {
      const user = userEvent.setup();
      const onBrandClick = jest.fn();

      render(<TopNavigation onBrandClick={onBrandClick} />);
      
      const brandLink = screen.getByRole('link', { name: /กลับไปหน้าโปรไฟล์/i });
      await user.click(brandLink);
      
      expect(onBrandClick).toHaveBeenCalledTimes(1);
    });

    it('calls onLogoClick when logo is clicked', async () => {
      const user = userEvent.setup();
      const onLogoClick = jest.fn();

      render(<TopNavigation onLogoClick={onLogoClick} />);
      
      const logoButton = screen.getByRole('button', { name: /โลโก้ JAOTHUI/i });
      await user.click(logoButton);
      
      expect(onLogoClick).toHaveBeenCalledTimes(1);
    });
  });
});
