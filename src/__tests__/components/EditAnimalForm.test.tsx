import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditAnimalForm } from '@/components/animals/EditAnimalForm';

/**
 * Mock animal data for testing
 */
const mockAnimal = {
  id: 'test-animal-id',
  farmId: 'test-farm-id',
  tagId: '001',
  name: 'นาเดีย',
  type: 'WATER_BUFFALO' as const,
  gender: 'FEMALE' as const,
  status: 'ACTIVE' as const,
  birthDate: '2019-03-15',
  color: 'ดำ',
  weightKg: 450.5,
  heightCm: 145,
  motherTag: 'M001',
  fatherTag: 'F001',
  genome: 'Test genome data',
  imageUrl: null,
  createdAt: '2025-01-15T08:00:00.000Z',
  updatedAt: '2025-11-16T10:00:00.000Z',
};

/**
 * Mock fetch API
 */
global.fetch = jest.fn();

describe('EditAnimalForm Component', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    (global.fetch as jest.Mock).mockReset();
  });

  describe('Form Rendering', () => {
    it('renders form with correct title and description', () => {
      render(<EditAnimalForm animal={mockAnimal} />);
      
      expect(screen.getByText('แก้ไขข้อมูลกระบือ')).toBeInTheDocument();
      expect(screen.getByText('แก้ไขข้อมูลที่ต้องการเปลี่ยนแปลง')).toBeInTheDocument();
    });

    it('displays read-only fields with correct values', () => {
      render(<EditAnimalForm animal={mockAnimal} />);
      
      expect(screen.getByText('001')).toBeInTheDocument(); // tagId
      expect(screen.getByText('กระบือน้ำ')).toBeInTheDocument(); // type translated
      expect(screen.getByText('เมีย')).toBeInTheDocument(); // gender translated
    });

    it('pre-populates editable fields with existing data', () => {
      render(<EditAnimalForm animal={mockAnimal} />);
      
      expect(screen.getByDisplayValue('นาเดีย')).toBeInTheDocument();
      expect(screen.getByDisplayValue('ดำ')).toBeInTheDocument();
      expect(screen.getByDisplayValue('450.5')).toBeInTheDocument();
      expect(screen.getByDisplayValue('145')).toBeInTheDocument();
      expect(screen.getByDisplayValue('M001')).toBeInTheDocument();
      expect(screen.getByDisplayValue('F001')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test genome data')).toBeInTheDocument();
    });

    it('renders all editable form fields', () => {
      render(<EditAnimalForm animal={mockAnimal} />);
      
      expect(screen.getByLabelText(/ชื่อกระบือ/)).toBeInTheDocument();
      expect(screen.getByLabelText(/สี/)).toBeInTheDocument();
      expect(screen.getByLabelText(/น้ำหนัก/)).toBeInTheDocument();
      expect(screen.getByLabelText(/ส่วนสูง/)).toBeInTheDocument();
      expect(screen.getByLabelText(/หมายเลขแท็กแม่/)).toBeInTheDocument();
      expect(screen.getByLabelText(/หมายเลขแท็กพ่อ/)).toBeInTheDocument();
      expect(screen.getByLabelText(/ข้อมูลจีโนม/)).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('submits form with updated data successfully', async () => {
      const mockOnSuccess = jest.fn();
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            animal: { ...mockAnimal, name: 'นาเดียทอง' },
          },
        }),
      });

      render(<EditAnimalForm animal={mockAnimal} onSuccess={mockOnSuccess} />);

      // Update the name field
      const nameInput = screen.getByLabelText(/ชื่อกระบือ/);
      await user.clear(nameInput);
      await user.type(nameInput, 'นาเดียทอง');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /บันทึกการแก้ไข/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/animals/${mockAnimal.id}`,
          expect.objectContaining({
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
          })
        );
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('displays loading state during submission', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<EditAnimalForm animal={mockAnimal} />);

      const submitButton = screen.getByRole('button', { name: /บันทึกการแก้ไข/ });
      await user.click(submitButton);

      expect(screen.getByText('กำลังบันทึกข้อมูล...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('displays error message on submission failure', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: {
            message: 'ไม่สามารถอัปเดตข้อมูลได้',
          },
        }),
      });

      render(<EditAnimalForm animal={mockAnimal} />);

      const submitButton = screen.getByRole('button', { name: /บันทึกการแก้ไข/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/ไม่สามารถอัปเดตข้อมูลได้/)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('validates weight is a positive number', async () => {
      const user = userEvent.setup();

      render(<EditAnimalForm animal={mockAnimal} />);

      const weightInput = screen.getByLabelText(/น้ำหนัก/);
      await user.clear(weightInput);
      await user.type(weightInput, '-100');

      const submitButton = screen.getByRole('button', { name: /บันทึกการแก้ไข/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/น้ำหนักต้องมากกว่า 0/)).toBeInTheDocument();
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('validates height is a positive integer', async () => {
      const user = userEvent.setup();

      render(<EditAnimalForm animal={mockAnimal} />);

      const heightInput = screen.getByLabelText(/ส่วนสูง/);
      await user.clear(heightInput);
      await user.type(heightInput, '-50');

      const submitButton = screen.getByRole('button', { name: /บันทึกการแก้ไข/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/ส่วนสูงต้องมากกว่า 0/)).toBeInTheDocument();
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('validates name does not exceed 255 characters', async () => {
      const user = userEvent.setup();

      render(<EditAnimalForm animal={mockAnimal} />);

      const nameInput = screen.getByLabelText(/ชื่อกระบือ/);
      await user.clear(nameInput);
      await user.type(nameInput, 'a'.repeat(256));

      const submitButton = screen.getByRole('button', { name: /บันทึกการแก้ไข/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/ชื่อกระบือต้องไม่เกิน 255 ตัวอักษร/)).toBeInTheDocument();
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Form Cancel', () => {
    it('calls onCancel when cancel button is clicked', async () => {
      const mockOnCancel = jest.fn();
      const user = userEvent.setup();

      render(<EditAnimalForm animal={mockAnimal} onCancel={mockOnCancel} />);

      const cancelButton = screen.getByRole('button', { name: /ยกเลิก/ });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('resets form to initial values on cancel', async () => {
      const user = userEvent.setup();

      render(<EditAnimalForm animal={mockAnimal} />);

      // Update the name field
      const nameInput = screen.getByLabelText(/ชื่อกระบือ/);
      await user.clear(nameInput);
      await user.type(nameInput, 'Modified Name');

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /ยกเลิก/ });
      await user.click(cancelButton);

      // Verify form reset
      expect(nameInput).toHaveValue('นาเดีย');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels on form fields', () => {
      render(<EditAnimalForm animal={mockAnimal} />);

      expect(screen.getByLabelText(/ชื่อกระบือ/)).toHaveAttribute('aria-invalid', 'false');
      expect(screen.getByLabelText(/สี/)).toHaveAttribute('aria-invalid', 'false');
      expect(screen.getByLabelText(/น้ำหนัก/)).toHaveAttribute('aria-invalid', 'false');
      expect(screen.getByLabelText(/ส่วนสูง/)).toHaveAttribute('aria-invalid', 'false');
    });

    it('has minimum touch target height on buttons', () => {
      render(<EditAnimalForm animal={mockAnimal} />);

      const submitButton = screen.getByRole('button', { name: /บันทึกการแก้ไข/ });
      const cancelButton = screen.getByRole('button', { name: /ยกเลิก/ });

      expect(submitButton.className).toContain('h-12');
      expect(cancelButton.className).toContain('h-12');
    });

    it('displays error messages with proper ARIA attributes', async () => {
      const user = userEvent.setup();

      render(<EditAnimalForm animal={mockAnimal} />);

      const nameInput = screen.getByLabelText(/ชื่อกระบือ/);
      await user.clear(nameInput);
      await user.type(nameInput, 'a'.repeat(256));

      const submitButton = screen.getByRole('button', { name: /บันทึกการแก้ไข/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
        expect(nameInput).toHaveAttribute('aria-describedby', 'name-error');
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  describe('Mobile Responsiveness', () => {
    it('uses mobile-first input sizes', () => {
      render(<EditAnimalForm animal={mockAnimal} />);

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach((input) => {
        expect(input.className).toContain('h-12');
        expect(input.className).toContain('text-base');
      });
    });

    it('renders form with glassmorphic card styling', () => {
      const { container } = render(<EditAnimalForm animal={mockAnimal} />);

      const card = container.querySelector('.bg-card\\/80.backdrop-blur-sm');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles animal with null optional fields', () => {
      const animalWithNulls = {
        ...mockAnimal,
        name: null,
        color: null,
        weightKg: null,
        heightCm: null,
        motherTag: null,
        fatherTag: null,
        genome: null,
        birthDate: null,
      };

      render(<EditAnimalForm animal={animalWithNulls} />);

      expect(screen.getByLabelText(/ชื่อกระบือ/)).toHaveValue('');
      expect(screen.getByLabelText(/สี/)).toHaveValue('');
    });

    it('converts empty strings to null in submission payload', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { animal: mockAnimal },
        }),
      });

      render(<EditAnimalForm animal={mockAnimal} />);

      // Clear the name field to make it empty
      const nameInput = screen.getByLabelText(/ชื่อกระบือ/);
      await user.clear(nameInput);

      const submitButton = screen.getByRole('button', { name: /บันทึกการแก้ไข/ });
      await user.click(submitButton);

      await waitFor(() => {
        const callArgs = (global.fetch as jest.Mock).mock.calls[0];
        const requestBody = JSON.parse(callArgs[1].body);
        expect(requestBody.name).toBeNull();
      });
    });

    it('handles external loading state', () => {
      render(<EditAnimalForm animal={mockAnimal} isLoading={true} />);

      const submitButton = screen.getByRole('button', { name: /บันทึกการแก้ไข/ });
      const cancelButton = screen.getByRole('button', { name: /ยกเลิก/ });

      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach((input) => {
        expect(input).toBeDisabled();
      });
    });
  });
});
