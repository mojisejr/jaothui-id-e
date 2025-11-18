/**
 * ActivityCard Component Tests - Jaothui ID-Trace System
 * 
 * Unit tests for ActivityCard component
 * Tests display, status badges, and action buttons
 * 
 * @see /src/components/activities/ActivityCard.tsx
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActivityCard from '@/components/activities/ActivityCard';
import { Activity } from '@/types/activity';

describe('ActivityCard', () => {
  const mockActivity: Activity = {
    id: 'activity-1',
    farmId: 'farm-1',
    animalId: 'animal-1',
    title: 'ให้อาหาร',
    description: 'ให้อาหารเช้า',
    activityDate: '2025-11-18T00:00:00.000Z',
    dueDate: '2025-11-20T00:00:00.000Z',
    status: 'PENDING',
    statusReason: null,
    createdBy: 'user-1',
    completedBy: null,
    completedAt: null,
    createdAt: '2025-11-18T00:00:00.000Z',
    updatedAt: '2025-11-18T00:00:00.000Z',
    animal: {
      id: 'animal-1',
      tagId: '001',
      name: 'นาเดีย',
      imageUrl: null,
    },
  };

  it('renders activity title correctly', () => {
    render(<ActivityCard activity={mockActivity} />);
    expect(screen.getByText('ให้อาหาร')).toBeInTheDocument();
  });

  it('renders animal information', () => {
    render(<ActivityCard activity={mockActivity} />);
    expect(screen.getByText(/นาเดีย/)).toBeInTheDocument();
  });

  it('renders status badge with correct text', () => {
    render(<ActivityCard activity={mockActivity} />);
    expect(screen.getByText('รอดำเนินการ')).toBeInTheDocument();
  });

  it('renders action buttons for PENDING status', () => {
    const mockOnStatusUpdate = jest.fn();
    render(<ActivityCard activity={mockActivity} onStatusUpdate={mockOnStatusUpdate} />);
    
    expect(screen.getByLabelText('ทำเสร็จแล้ว')).toBeInTheDocument();
    expect(screen.getByLabelText('ยกเลิก')).toBeInTheDocument();
  });

  it('does not render action buttons for COMPLETED status', () => {
    const completedActivity = { ...mockActivity, status: 'COMPLETED' as const };
    render(<ActivityCard activity={completedActivity} />);
    
    expect(screen.queryByLabelText('ทำเสร็จแล้ว')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('ยกเลิก')).not.toBeInTheDocument();
  });

  it('calls onStatusUpdate when complete button is clicked', async () => {
    const mockOnStatusUpdate = jest.fn().mockResolvedValue(undefined);
    render(<ActivityCard activity={mockActivity} onStatusUpdate={mockOnStatusUpdate} />);
    
    const completeButton = screen.getByLabelText('ทำเสร็จแล้ว');
    fireEvent.click(completeButton);
    
    await waitFor(() => {
      expect(mockOnStatusUpdate).toHaveBeenCalledWith('activity-1', 'COMPLETED');
    });
  });

  it('calls onStatusUpdate when cancel button is clicked', async () => {
    const mockOnStatusUpdate = jest.fn().mockResolvedValue(undefined);
    render(<ActivityCard activity={mockActivity} onStatusUpdate={mockOnStatusUpdate} />);
    
    const cancelButton = screen.getByLabelText('ยกเลิก');
    fireEvent.click(cancelButton);
    
    await waitFor(() => {
      expect(mockOnStatusUpdate).toHaveBeenCalledWith('activity-1', 'CANCELLED');
    });
  });

  it('calls onPress when card is clicked', () => {
    const mockOnPress = jest.fn();
    render(<ActivityCard activity={mockActivity} onPress={mockOnPress} />);
    
    const card = screen.getByText('ให้อาหาร').closest('.cursor-pointer');
    if (card) {
      fireEvent.click(card);
    }
    
    expect(mockOnPress).toHaveBeenCalled();
  });

  it('displays due date correctly', () => {
    render(<ActivityCard activity={mockActivity} />);
    // Due date should be formatted as DD/MM/YYYY in BE calendar
    expect(screen.getByText(/ครบกำหนด:/)).toBeInTheDocument();
  });

  it('shows overdue warning for past due dates', () => {
    const overdueActivity = {
      ...mockActivity,
      dueDate: '2020-01-01T00:00:00.000Z', // Past date
      status: 'PENDING' as const,
    };
    
    render(<ActivityCard activity={overdueActivity} />);
    // Should have destructive styling for overdue
    const dueDateElement = screen.getByText(/ครบกำหนด:/).closest('div');
    expect(dueDateElement).toHaveClass('text-destructive');
  });
});
