import { renderHook, act } from '@testing-library/react';
import useAsyncOperation from '../useAsyncOperation';

describe('useAsyncOperation', () => {
  it('initializes with correct default state', () => {
    const mockAsyncFn = jest.fn();
    const { result } = renderHook(() => useAsyncOperation(mockAsyncFn));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.retryCount).toBe(0);
    expect(result.current.isIdle).toBe(true);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.isRetrying).toBe(false);
  });

  it('initializes with custom initial data', () => {
    const mockAsyncFn = jest.fn();
    const initialData = { test: 'data' };
    const { result } = renderHook(() => 
      useAsyncOperation(mockAsyncFn, { initialData })
    );

    expect(result.current.data).toEqual(initialData);
  });

  it('handles successful async operation', async () => {
    const mockData = { result: 'success' };
    const mockAsyncFn = jest.fn().mockResolvedValue(mockData);
    const { result } = renderHook(() => useAsyncOperation(mockAsyncFn));

    await act(async () => {
      await result.current.execute('test-arg');
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isSuccess).toBe(true);
    expect(mockAsyncFn).toHaveBeenCalledWith('test-arg', expect.any(Object));
  });

  it('handles failed async operation', async () => {
    const mockError = new Error('Test error');
    const mockAsyncFn = jest.fn().mockRejectedValue(mockError);
    const { result } = renderHook(() => useAsyncOperation(mockAsyncFn));

    await act(async () => {
      try {
        await result.current.execute();
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(mockError);
    expect(result.current.isError).toBe(true);
  });

  it('calls success callback on successful execution', async () => {
    const mockData = { result: 'success' };
    const mockAsyncFn = jest.fn().mockResolvedValue(mockData);
    const onSuccess = jest.fn();

    const { result } = renderHook(() => 
      useAsyncOperation(mockAsyncFn, { onSuccess })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(onSuccess).toHaveBeenCalledWith(mockData);
  });

  it('calls error callback on failed execution', async () => {
    const mockError = new Error('Test error');
    const mockAsyncFn = jest.fn().mockRejectedValue(mockError);
    const onError = jest.fn();

    const { result } = renderHook(() => 
      useAsyncOperation(mockAsyncFn, { onError })
    );

    await act(async () => {
      try {
        await result.current.execute();
      } catch (error) {
        // Expected to throw
      }
    });

    expect(onError).toHaveBeenCalledWith(mockError);
  });

  it('resets state correctly', () => {
    const mockAsyncFn = jest.fn();
    const initialData = { initial: true };
    const { result } = renderHook(() => 
      useAsyncOperation(mockAsyncFn, { initialData })
    );

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toEqual(initialData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.retryCount).toBe(0);
  });
});