import { render, screen, fireEvent } from '@testing-library/react';
import { AnimalPanelContent } from '@/app/animals/[id]/panel/AnimalPanelContent';
import { AnimalType, AnimalGender, AnimalStatus } from '@prisma/client';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('AnimalPanelContent Component', () => {
  const mockAnimal = {
    id: 'test-animal-id',
    farmId: 'test-farm-id',
    tagId: '001',
    name: 'นาเดีย',
    type: 'WATER_BUFFALO' as AnimalType,
    gender: 'FEMALE' as AnimalGender,
    status: 'ACTIVE' as AnimalStatus,
    birthDate: new Date('2019-03-15'),
    color: 'ดำ',
    weightKg: 450.5,
    heightCm: 145,
    motherTag: 'M001',
    fatherTag: 'F001',
    genome: null,
    imageUrl: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  it('renders tab navigation with both tabs', () => {
    render(<AnimalPanelContent animal={mockAnimal} notificationCount={0} />);
    
    expect(screen.getByText('แก้ไขข้อมูล')).toBeInTheDocument();
    expect(screen.getByText('จัดการกิจกรรม')).toBeInTheDocument();
  });

  it('displays edit tab content by default', () => {
    render(<AnimalPanelContent animal={mockAnimal} notificationCount={0} />);
    
    expect(screen.getByText('แก้ไขข้อมูลกระบือ')).toBeInTheDocument();
    expect(screen.getByText(/ฟอร์มแก้ไขข้อมูลสำหรับ: นาเดีย/)).toBeInTheDocument();
  });

  it('switches to activities tab when clicked', () => {
    render(<AnimalPanelContent animal={mockAnimal} notificationCount={0} />);
    
    const activitiesTab = screen.getByRole('tab', { name: /🎯 จัดการกิจกรรม/ });
    fireEvent.click(activitiesTab);
    
    expect(screen.getByRole('heading', { name: 'จัดการกิจกรรม' })).toBeInTheDocument();
    expect(screen.getByText(/สร้างและจัดการกิจกรรมสำหรับ: นาเดีย/)).toBeInTheDocument();
  });

  it('displays animal name in content areas', () => {
    render(<AnimalPanelContent animal={mockAnimal} notificationCount={0} />);
    
    // Edit tab should show animal name
    expect(screen.getByText(/นาเดีย/)).toBeInTheDocument();
    
    // Switch to activities tab
    const activitiesTab = screen.getByRole('tab', { name: /🎯 จัดการกิจกรรม/ });
    fireEvent.click(activitiesTab);
    
    // Activities tab should also show animal name
    expect(screen.getByText(/นาเดีย/)).toBeInTheDocument();
  });

  it('displays tagId when animal has no name', () => {
    const animalWithoutName = {
      ...mockAnimal,
      name: null,
    };
    
    render(<AnimalPanelContent animal={animalWithoutName} notificationCount={0} />);
    
    expect(screen.getByText(/001/)).toBeInTheDocument();
  });

  it('handles keyboard navigation with Arrow keys', () => {
    render(<AnimalPanelContent animal={mockAnimal} notificationCount={0} />);
    
    const editTab = screen.getByRole('tab', { name: /📋 แก้ไขข้อมูล/ });
    
    // Press ArrowRight to switch to activities tab
    fireEvent.keyDown(editTab, { key: 'ArrowRight' });
    
    expect(screen.getByRole('heading', { name: 'จัดการกิจกรรม' })).toBeInTheDocument();
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(<AnimalPanelContent animal={mockAnimal} notificationCount={0} />);
    
    const editTab = screen.getByRole('tab', { name: /📋 แก้ไขข้อมูล/ });
    const activitiesTab = screen.getByRole('tab', { name: /🎯 จัดการกิจกรรม/ });
    
    expect(editTab).toHaveAttribute('aria-selected', 'true');
    expect(activitiesTab).toHaveAttribute('aria-selected', 'false');
    
    expect(editTab).toHaveAttribute('aria-controls', 'tabpanel-edit');
    expect(activitiesTab).toHaveAttribute('aria-controls', 'tabpanel-activities');
  });
});
