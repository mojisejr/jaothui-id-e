import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateActivityForm } from '@/components/activities/CreateActivityForm';

/**
 * Mock fetch API
 */
global.fetch = jest.fn();

describe('CreateActivityForm Component', () => {
  const mockAnimalId = 'test-animal-id';
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    (global.fetch as jest.Mock).mockReset();
    mockOnSuccess.mockReset();
    mockOnCancel.mockReset();
  });

  describe('Form Rendering', () => {
    it('renders form with correct title and description', () => {
      render(<CreateActivityForm animalId={mockAnimalId} />);
      
      expect(screen.getByText('เพิ่มกิจกรรม')).toBeInTheDocument();
      expect(screen.getByText('บันทึกกิจกรรมสำหรับกระบือ')).toBeInTheDocument();
    });

    it('renders all required form fields', () => {
      render(<CreateActivityForm animalId={mockAnimalId} />);
      
      // Check for required fields
      expect(screen.getByLabelText(/หัวข้อกิจกรรม/)).toBeInTheDocument();
      expect(screen.getByLabelText(/วันที่กิจกรรม/)).toBeInTheDocument();
      
      // Check for optional fields
      expect(screen.getByLabelText(/รายละเอียด/)).toBeInTheDocument();
      expect(screen.getByLabelText(/วันครบกำหนด/)).toBeInTheDocument();
    });

    it('renders submit and cancel buttons', () => {
      render(<CreateActivityForm animalId={mockAnimalId} />);
      
      expect(screen.getByRole('button', { name: /ยืนยันเพิ่มกิจกรรม/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ยกเลิก/ })).toBeInTheDocument();
    });

    it('marks required fields with asterisk', () => {
      render(<CreateActivityForm animalId={mockAnimalId} />);
      
      const titleLabel = screen.getByText(/หัวข้อกิจกรรม/).closest('label');
      const activityDateLabel = screen.getByText(/วันที่กิจกรรม/).closest('label');
      
      expect(titleLabel?.textContent).toContain('*');
      expect(activityDateLabel?.textContent).toContain('*');
    });
  });

  describe('Form Validation', () => {
    it('shows validation error when submitting without title', async () => {
      const user = userEvent.setup();
      render(<CreateActivityForm animalId={mockAnimalId} />);
      
      const submitButton = screen.getByRole('button', { name: /ยืนยันเพิ่มกิจกรรม/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/หัวข้อต้องระบุ/)).toBeInTheDocument();
      });
    });

    it('shows validation error when submitting without activity date', async () => {
      const user = userEvent.setup();
      render(<CreateActivityForm animalId={mockAnimalId} />);
      
      const titleInput = screen.getByLabelText(/หัวข้อกิจกรรม/);
      await user.type(titleInput, 'ตรวจสุขภาพ');
      
      const submitButton = screen.getByRole('button', { name: /ยืนยันเพิ่มกิจกรรม/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/วันที่กิจกรรมต้องระบุ/)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('calls fetch API when submitting valid form', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        success: true,
        data: {
          activity: {
            id: 'new-activity-id',
            title: 'ตรวจสุขภาพ',
            status: 'PENDING',
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(
        <CreateActivityForm
          animalId={mockAnimalId}
          onSuccess={mockOnSuccess}
        />
      );
      
      // Fill in title
      const titleInput = screen.getByLabelText(/หัวข้อกิจกรรม/) as HTMLInputElement;
      await user.type(titleInput, 'ตรวจสุขภาพ');
      
      // Fill in activity date
      const activityDateInput = screen.getByLabelText(/วันที่กิจกรรม/) as HTMLInputElement;
      activityDateInput.value = '2025-11-20';
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /ยืนยันเพิ่มกิจกรรม/ });
      await user.click(submitButton);
      
      // Wait for submission
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/activities', expect.any(Object));
      }, { timeout: 3000 });
    });

    it('displays error message when API returns error', async () => {
      const user = userEvent.setup();
      const errorMessage = 'ไม่สามารถเพิ่มกิจกรรมได้';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: { message: errorMessage },
        }),
      });

      render(<CreateActivityForm animalId={mockAnimalId} />);
      
      // Fill in form
      const titleInput = screen.getByLabelText(/หัวข้อกิจกรรม/) as HTMLInputElement;
      await user.type(titleInput, 'ตรวจสุขภาพ');
      
      const activityDateInput = screen.getByLabelText(/วันที่กิจกรรม/) as HTMLInputElement;
      activityDateInput.value = '2025-11-20';
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /ยืนยันเพิ่มกิจกรรม/ });
      await user.click(submitButton);
      
      // Wait for error message
      await waitFor(() => {
        expect(screen.queryByText(errorMessage)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('handles submission with description field', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { activity: {} } }),
      });

      render(<CreateActivityForm animalId={mockAnimalId} />);
      
      // Fill in all fields
      const titleInput = screen.getByLabelText(/หัวข้อกิจกรรม/) as HTMLInputElement;
      await user.type(titleInput, 'ตรวจสุขภาพ');
      
      const descriptionInput = screen.getByLabelText(/รายละเอียด/) as HTMLTextAreaElement;
      await user.type(descriptionInput, 'ตรวจสุขภาพทั่วไป');
      
      const activityDateInput = screen.getByLabelText(/วันที่กิจกรรม/) as HTMLInputElement;
      activityDateInput.value = '2025-11-20';
      
      // Submit
      const submitButton = screen.getByRole('button', { name: /ยืนยันเพิ่มกิจกรรม/ });
      await user.click(submitButton);
      
      // Verify fetch was called
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('Cancel Functionality', () => {
    it('calls onCancel callback when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <CreateActivityForm
          animalId={mockAnimalId}
          onCancel={mockOnCancel}
        />
      );
      
      const cancelButton = screen.getByRole('button', { name: /ยกเลิก/ });
      await user.click(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('resets form when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<CreateActivityForm animalId={mockAnimalId} />);
      
      // Fill in form fields
      const titleInput = screen.getByLabelText(/หัวข้อกิจกรรม/);
      await user.type(titleInput, 'ตรวจสุขภาพ');
      
      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /ยกเลิก/ });
      await user.click(cancelButton);
      
      // Verify form is reset
      expect(titleInput).toHaveValue('');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for required fields', () => {
      render(<CreateActivityForm animalId={mockAnimalId} />);
      
      const titleInput = screen.getByLabelText(/หัวข้อกิจกรรม/);
      const activityDateInput = screen.getByLabelText(/วันที่กิจกรรม/);
      
      expect(titleInput).toHaveAttribute('aria-required', 'true');
      expect(activityDateInput).toHaveAttribute('aria-required', 'true');
    });

    it('associates error messages with inputs using aria-describedby', async () => {
      const user = userEvent.setup();
      render(<CreateActivityForm animalId={mockAnimalId} />);
      
      const submitButton = screen.getByRole('button', { name: /ยืนยันเพิ่มกิจกรรม/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        const titleInput = screen.getByLabelText(/หัวข้อกิจกรรม/);
        expect(titleInput).toHaveAttribute('aria-describedby', 'title-error');
        expect(titleInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });
});
