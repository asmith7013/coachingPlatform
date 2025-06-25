import { useState, useEffect } from 'react';
import { fetchVisitScheduleData, VisitScheduleData } from '@actions/visits/visit-schedule-data';
import { handleClientError } from '@error/handlers/client';

export function useVisitScheduleData(visitId: string | null) {
  const [data, setData] = useState<VisitScheduleData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visitId) {
      setData(null);
      setError(null);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await fetchVisitScheduleData(visitId);
        
        if (result.success) {
          setData(result.data || null);
        } else {
          const errorMessage = handleClientError(
            new Error(result.error || 'Failed to fetch data'),
            'useVisitScheduleData'
          );
          setError(errorMessage);
        }
      } catch (err) {
        const errorMessage = handleClientError(err, 'useVisitScheduleData');
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [visitId]);

  return { data, isLoading, error };
} 