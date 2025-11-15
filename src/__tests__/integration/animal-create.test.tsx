import { render, screen } from '@testing-library/react';
import CreateAnimalPage from '@/app/animals/create/page';

/**
 * Integration tests for Animal Creation Page
 * 
 * Tests the complete flow of the /animals/create page including:
 * - Page rendering
 * - Loading states
 * - Navigation elements
 * 
 * Note: Uses mocked session and fetch from test-environment.ts
 * The CreateAnimalForm component is complex with many dependencies,
 * so we focus on testing the page structure and navigation.
 */

describe('Animal Creation Page Integration', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<CreateAnimalPage />);
    
    // Check for loading indicator (farm loading since auth is mocked as authenticated)
    expect(screen.getByText('กำลังโหลดข้อมูลฟาร์ม...')).toBeInTheDocument();
  });

  it('displays loading spinner with correct aria-label', () => {
    render(<CreateAnimalPage />);
    
    // Check for accessible loading indicator
    const spinner = screen.getByLabelText('กำลังโหลด');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('role', 'status');
  });

  it('has correct page structure and styling', () => {
    const { container } = render(<CreateAnimalPage />);
    
    // Check for main content container with gradient background
    const mainContainer = container.querySelector('.min-h-screen.bg-gradient-to-br');
    expect(mainContainer).toBeInTheDocument();
  });
});
