import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/ui/status-badge';
import { ActivityStatus } from '@prisma/client';

describe('StatusBadge Component', () => {
  describe('Rendering with different statuses', () => {
    it('renders PENDING status correctly', () => {
      render(<StatusBadge status="PENDING" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('○');
      expect(badge).toHaveTextContent('รอดำเนินการ');
      expect(badge).toHaveClass('text-yellow-600', 'bg-yellow-50', 'border-yellow-200');
    });

    it('renders COMPLETED status correctly', () => {
      render(<StatusBadge status="COMPLETED" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('✅');
      expect(badge).toHaveTextContent('ดำเนินการแล้ว');
      expect(badge).toHaveClass('text-green-600', 'bg-green-50', 'border-green-200');
    });

    it('renders CANCELLED status correctly', () => {
      render(<StatusBadge status="CANCELLED" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('❌');
      expect(badge).toHaveTextContent('ยกเลิก');
      expect(badge).toHaveClass('text-red-600', 'bg-red-50', 'border-red-200');
    });

    it('renders OVERDUE status correctly', () => {
      render(<StatusBadge status="OVERDUE" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('⏰');
      expect(badge).toHaveTextContent('เลยกำหนด');
      expect(badge).toHaveClass('text-orange-600', 'bg-orange-50', 'border-orange-200');
    });
  });

  describe('Label visibility', () => {
    it('shows label by default', () => {
      render(<StatusBadge status="PENDING" />);
      
      expect(screen.getByText('รอดำเนินการ')).toBeInTheDocument();
    });

    it('hides label when showLabel is false', () => {
      render(<StatusBadge status="PENDING" showLabel={false} />);
      
      expect(screen.queryByText('รอดำเนินการ')).not.toBeInTheDocument();
      expect(screen.getByText('○')).toBeInTheDocument();
    });
  });

  describe('Size variants', () => {
    it('renders small size correctly', () => {
      render(<StatusBadge status="PENDING" size="sm" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('text-xs', 'min-h-[32px]');
    });

    it('renders medium size by default', () => {
      render(<StatusBadge status="PENDING" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('text-sm', 'min-h-[44px]');
    });

    it('renders large size correctly', () => {
      render(<StatusBadge status="PENDING" size="lg" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('text-base', 'min-h-[48px]');
    });
  });

  describe('Accessibility', () => {
    it('has proper role attribute', () => {
      render(<StatusBadge status="PENDING" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toBeInTheDocument();
    });

    it('has proper aria-label for PENDING status', () => {
      render(<StatusBadge status="PENDING" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute('aria-label', 'สถานะ: รอดำเนินการ');
    });

    it('has proper aria-label for COMPLETED status', () => {
      render(<StatusBadge status="COMPLETED" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute('aria-label', 'สถานะ: ดำเนินการแล้ว');
    });

    it('has proper aria-label for CANCELLED status', () => {
      render(<StatusBadge status="CANCELLED" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute('aria-label', 'สถานะ: ยกเลิก');
    });

    it('has proper aria-label for OVERDUE status', () => {
      render(<StatusBadge status="OVERDUE" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute('aria-label', 'สถานะ: เลยกำหนด');
    });

    it('marks icon as aria-hidden', () => {
      const { container } = render(<StatusBadge status="PENDING" />);
      
      const iconSpan = container.querySelector('span[aria-hidden="true"]');
      expect(iconSpan).toBeInTheDocument();
      expect(iconSpan).toHaveTextContent('○');
    });
  });

  describe('Custom className', () => {
    it('accepts additional className', () => {
      render(<StatusBadge status="PENDING" className="custom-class" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('custom-class');
    });

    it('preserves base classes when className is added', () => {
      render(<StatusBadge status="PENDING" className="custom-class" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('custom-class');
      expect(badge).toHaveClass('text-yellow-600');
      expect(badge).toHaveClass('bg-yellow-50');
    });
  });

  describe('Touch-friendly sizing', () => {
    it('meets minimum touch target size for medium (default)', () => {
      render(<StatusBadge status="PENDING" />);
      
      const badge = screen.getByRole('status');
      // Minimum 44px height for touch targets
      expect(badge).toHaveClass('min-h-[44px]');
    });

    it('meets minimum touch target size for large', () => {
      render(<StatusBadge status="PENDING" size="lg" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('min-h-[48px]');
    });
  });

  describe('Visual hierarchy', () => {
    it('has proper border and background styling', () => {
      render(<StatusBadge status="PENDING" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('rounded-md', 'border');
    });

    it('has proper spacing between icon and label', () => {
      render(<StatusBadge status="PENDING" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('gap-1');
    });

    it('has proper padding', () => {
      render(<StatusBadge status="PENDING" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('px-2.5', 'py-0.5');
    });
  });

  describe('Integration with ActivityStatus enum', () => {
    it('works with ActivityStatus type from Prisma', () => {
      const status: ActivityStatus = 'PENDING';
      
      render(<StatusBadge status={status} />);
      
      const badge = screen.getByRole('status');
      expect(badge).toBeInTheDocument();
    });

    it('handles all ActivityStatus enum values', () => {
      const statuses: ActivityStatus[] = ['PENDING', 'COMPLETED', 'CANCELLED', 'OVERDUE'];
      
      statuses.forEach((status) => {
        const { unmount } = render(<StatusBadge status={status} />);
        
        const badge = screen.getByRole('status');
        expect(badge).toBeInTheDocument();
        
        unmount();
      });
    });
  });
});
