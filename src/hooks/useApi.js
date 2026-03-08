import { useState, useEffect, useCallback } from 'react';

export function useApi(fetchFn, params = {}, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const paramsKey = JSON.stringify(params);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn(params);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => {
    refetch();
  }, [refetch, ...dependencies]);

  return { data, loading, error, refetch };
}
