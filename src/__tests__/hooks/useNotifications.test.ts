/**
 * Tests for useNotifications Hook
 * 
 * Test coverage for the custom useNotifications hook that uses SWR
 * for notification badge count management.
 * 
 * Coverage:
 * - Data fetching on mount
 * - Correct return interface
 * - Mutate function availability
 * 
 * Note: SWR's aggressive caching in test environment makes it difficult
 * to test individual scenarios in isolation. The hook is tested for its
 * core interface and basic functionality. Error handling, retries, and
 * cache behavior are better tested in integration/E2E tests.
 * 
 * @framework Jest + React Testing Library
 * @language TypeScript
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react';
import { useNotifications } from '@/hooks/useNotifications';

// Mock fetch globally
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe('useNotifications', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  it('should fetch notification data successfully and provide correct interface', async () => {
    // Mock successful API response
    const mockResponse = {
      success: true,
      data: {
        badgeCount: 5,
        breakdown: {
          pending: 3,
          overdue: 2,
        },
        farmCounts: [
          {
            farmId: 'farm-123',
            farmName: 'ฟาร์มทดสอบ',
            count: 5,
          },
        ],
      },
      timestamp: new Date().toISOString(),
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    // Render hook
    const { result } = renderHook(() => useNotifications());

    // Initially has default values
    expect(result.current.badgeCount).toBe(0);
    expect(result.current.breakdown).toEqual({ pending: 0, overdue: 0 });

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify data is correct
    expect(result.current.badgeCount).toBe(5);
    expect(result.current.breakdown).toEqual({
      pending: 3,
      overdue: 2,
    });
    expect(result.current.error).toBeNull();

    // Verify all required properties exist with correct types
    expect(typeof result.current.badgeCount).toBe('number');
    expect(typeof result.current.breakdown).toBe('object');
    expect(typeof result.current.breakdown.pending).toBe('number');
    expect(typeof result.current.breakdown.overdue).toBe('number');
    expect(typeof result.current.isLoading).toBe('boolean');
    expect(typeof result.current.mutate).toBe('function');
    expect(result.current.error === null || result.current.error instanceof Error).toBe(true);

    // Verify fetch was called correctly
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/notifications/badge',
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );
  });

  it('should provide mutate function that returns a promise', async () => {
    // Mock response
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { badgeCount: 3, breakdown: { pending: 2, overdue: 1 }, farmCounts: [] },
        timestamp: new Date().toISOString(),
      }),
    } as Response);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify mutate is a function
    expect(typeof result.current.mutate).toBe('function');

    // Verify mutate returns a promise
    const mutateResult = result.current.mutate();
    expect(mutateResult).toBeInstanceOf(Promise);

    // Wait for mutate to complete
    await mutateResult;
  });
});
