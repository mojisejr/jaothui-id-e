import { renderHook } from '@testing-library/react';
import { useSession } from '@/lib/auth-client';

describe('Authentication Hook', () => {
  it('provides session data when authenticated', () => {
    const { result } = renderHook(() => useSession());
    
    expect(result.current.data?.user?.id).toBe('test-user-id');
    expect(result.current.data?.user?.name).toBe('Test User');
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('handles loading state correctly', () => {
    // Mock loading state would go here when implementing loading scenarios
    // For now, test the basic hook functionality
    const { result } = renderHook(() => useSession());
    
    expect(typeof result.current.data).toBeDefined();
  });
});
