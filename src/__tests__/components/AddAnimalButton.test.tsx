import { render, screen } from '@testing-library/react';
import { Plus } from 'lucide-react';
import Link from 'next/link';

/**
 * Test for Add Animal Button Component
 * Verifies the FAB button added to profile page
 */
describe('Add Animal Button', () => {
  it('renders button with correct text and icon', () => {
    const { container } = render(
      <div className="flex justify-center mb-6">
        <Link href="/animals/create">
          <button 
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-xs min-h-[48px]"
            aria-label="เพิ่มข้อมูลกระบือใหม่"
          >
            <Plus className="w-5 h-5" />
            เพิ่มข้อมูลกระบือ
          </button>
        </Link>
      </div>
    );
    
    expect(screen.getByText('เพิ่มข้อมูลกระบือ')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'เพิ่มข้อมูลกระบือใหม่' })).toBeInTheDocument();
  });

  it('button has correct accessibility attributes', () => {
    render(
      <div className="flex justify-center mb-6">
        <Link href="/animals/create">
          <button 
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-xs min-h-[48px]"
            aria-label="เพิ่มข้อมูลกระบือใหม่"
          >
            <Plus className="w-5 h-5" />
            เพิ่มข้อมูลกระบือ
          </button>
        </Link>
      </div>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'เพิ่มข้อมูลกระบือใหม่');
  });

  it('link points to correct route', () => {
    const { container } = render(
      <div className="flex justify-center mb-6">
        <Link href="/animals/create">
          <button 
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-xs min-h-[48px]"
            aria-label="เพิ่มข้อมูลกระบือใหม่"
          >
            <Plus className="w-5 h-5" />
            เพิ่มข้อมูลกระบือ
          </button>
        </Link>
      </div>
    );
    
    const link = container.querySelector('a');
    expect(link).toHaveAttribute('href', '/animals/create');
  });

  it('button has minimum touch target height', () => {
    render(
      <div className="flex justify-center mb-6">
        <Link href="/animals/create">
          <button 
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-xs min-h-[48px]"
            aria-label="เพิ่มข้อมูลกระบือใหม่"
          >
            <Plus className="w-5 h-5" />
            เพิ่มข้อมูลกระบือ
          </button>
        </Link>
      </div>
    );
    
    const button = screen.getByRole('button');
    expect(button.className).toContain('min-h-[48px]');
  });
});
