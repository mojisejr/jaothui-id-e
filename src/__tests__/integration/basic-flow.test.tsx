import { render, screen } from '@testing-library/react';
import ProfilePage from '@/app/profile/page';

// Mock the session for integration tests
const mockSession = {
  user: {
    id: 'integration-test-user',
    name: 'Test Farmer',
    email: 'farmer@test.com',
    image: null,
  },
};

describe('Profile Page Integration', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('renders profile page structure', () => {
    render(<ProfilePage />);
    
    // Check that navigation exists
    expect(screen.getByLabelText('หน้าหลัก')).toBeInTheDocument();
    
    // Check that main brand text is rendered
    expect(screen.getByText('ระบบ ID-Trace')).toBeInTheDocument();
  });

  it('displays notification button', () => {
    render(<ProfilePage />);
    
    // Check that notification button exists
    const notificationButton = screen.getByLabelText(/การแจ้งเตือน/);
    expect(notificationButton).toBeInTheDocument();
  });

  it('renders menu grid structure', () => {
    render(<ProfilePage />);
    
    // Check that menu navigation exists
    const menuNav = screen.getByRole('navigation', { name: 'หน้าหลักเมนู' });
    expect(menuNav).toBeInTheDocument();
  });
});
