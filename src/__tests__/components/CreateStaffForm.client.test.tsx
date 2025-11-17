import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateStaffForm } from '@/components/staff/CreateStaffForm';

describe('CreateStaffForm (client)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows fallback error message when server returns empty body (405)', async () => {
    // Mock server response to return 405 with empty body
    jest.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 405 }) as unknown as Response
    );

    const onSuccess = jest.fn();

    render(<CreateStaffForm onSuccess={onSuccess} isLoading={false} />);

    // Fill form (use placeholders to avoid ambiguous labels)
    fireEvent.change(screen.getByPlaceholderText(/ตัวอย่าง: staff_001/i), {
      target: { value: 'staff_test' },
    });
    fireEvent.change(screen.getByPlaceholderText(/กรอกรหัสผ่าน/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText(/กรอกชื่อ/i), {
      target: { value: 'สมชาย' },
    });
    fireEvent.change(screen.getByPlaceholderText(/กรอกนามสกุล/i), {
      target: { value: 'ใจดี' },
    });

    fireEvent.click(screen.getByRole('button', { name: /ยืนยันเพิ่มพนักงาน/i }));

    await waitFor(() => {
      expect(screen.getByText(/ไม่สามารถเพิ่มพนักงานได้/i)).toBeInTheDocument();
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });
});
