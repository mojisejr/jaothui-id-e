import { render, screen } from '@testing-library/react';
import { ProfileCard, Farm } from '@/components/profile/ProfileCard';

describe('ProfileCard Component', () => {
  const mockFarm: Farm = {
    id: 'test-farm-id',
    name: 'ศรีวนาลัย',
    province: 'จังหวัดนครราชสีมา',
    code: 'F001',
    ownerId: 'test-user-id',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  it('renders farm information correctly', () => {
    render(<ProfileCard farm={mockFarm} userAvatar={undefined} />);
    
    expect(screen.getByText('ศรีวนาลัย')).toBeInTheDocument();
    expect(screen.getByText('จังหวัดนครราชสีมา')).toBeInTheDocument();
  });

  it('renders without province information', () => {
    const farmWithoutProvince: Farm = {
      ...mockFarm,
      name: 'ทดสอบฟาร์ม',
      province: null,
    };
    
    render(<ProfileCard farm={farmWithoutProvince} userAvatar={undefined} />);
    
    expect(screen.getByText('ทดสอบฟาร์ม')).toBeInTheDocument();
    expect(screen.queryByText(/จังหวัด/)).not.toBeInTheDocument();
  });

  it('displays user avatar when provided', () => {
    render(<ProfileCard farm={mockFarm} userAvatar="/test-avatar.jpg" />);
    
    const avatar = screen.getByAltText('รูปประจำตัวฟาร์มศรีวนาลัย');
    expect(avatar).toHaveAttribute('src', '/test-avatar.jpg');
  });

  it('falls back to default avatar when none provided', () => {
    render(<ProfileCard farm={mockFarm} userAvatar={undefined} />);
    
    const avatar = screen.getByAltText('รูปประจำตัวฟาร์มศรีวนาลัย');
    expect(avatar).toHaveAttribute('src', '/thuiLogo.png');
  });
});
