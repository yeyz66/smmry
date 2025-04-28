import { useState, useEffect } from 'react';
import axios from 'axios';

export type SummaryLength = 'very-short' | 'short' | 'medium' | 'long';
export type SummaryStyle = 'concise' | 'detailed' | 'bullet-points' | 'academic' | 'simplified';

export interface SummarizeOptions {
  length: SummaryLength;
  style: SummaryStyle;
  complexity: number;
}

export interface SummaryResult {
  summary: string;
  metadata: {
    originalWordCount: number;
    summaryWordCount: number;
    percentReduced: number;
    length: SummaryLength;
    style: SummaryStyle;
    complexity: number;
  };
}

interface QueueStatus {
  isInQueue: boolean;
  queuePosition: number;
}

export default function useSummarize() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [queueStatus, setQueueStatus] = useState<QueueStatus>({
    isInQueue: false,
    queuePosition: 0
  });
  
  // Polling interval (in ms) for queue status
  const POLL_INTERVAL = 3000;
  
  // Function to retry when in queue
  const retryFromQueue = async () => {
    if (!queueStatus.isInQueue) return;
    
    try {
      // Get the last options from somewhere (could store in state or localStorage)
      // For simplicity, we'll pass empty text which will trigger validation error
      // In a real app, you'd store the last text and options
      const response = await axios.post('/api/summarize', {
        text: localStorage.getItem('lastText') || '',
        length: localStorage.getItem('lastLength') as SummaryLength || 'short',
        style: localStorage.getItem('lastStyle') as SummaryStyle || 'concise',
        complexity: Number(localStorage.getItem('lastComplexity')) || 3
      });
      
      // If successful, we're out of the queue
      setResult(response.data);
      setQueueStatus({ isInQueue: false, queuePosition: 0 });
      setIsLoading(false);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Check if still in queue
        if (error.response.status === 429 && error.response.data?.queuePosition) {
          // Update queue position
          setQueueStatus({
            isInQueue: true,
            queuePosition: error.response.data.queuePosition
          });
          setError(`Rate limit exceeded. You're in queue position ${error.response.data.queuePosition}.`);
        } else {
          // Not a queue error, reset queue status
          setQueueStatus({ isInQueue: false, queuePosition: 0 });
          setError(error.response.data?.error || 'An error occurred while summarizing');
          setIsLoading(false);
        }
      } else {
        // Network error
        setQueueStatus({ isInQueue: false, queuePosition: 0 });
        setError('Network error. Please try again.');
        setIsLoading(false);
      }
    }
  };
  
  // Effect to poll for queue status when in queue
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (queueStatus.isInQueue && queueStatus.queuePosition > 0) {
      // Start polling
      intervalId = setInterval(() => {
        retryFromQueue();
      }, POLL_INTERVAL);
    }
    
    // Cleanup interval on unmount or when no longer in queue
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [queueStatus.isInQueue, queueStatus.queuePosition, retryFromQueue]);
  
  const summarize = async (text: string, options: SummarizeOptions) => {
    if (!text || text.trim().length < 10) {
      setError('Text must be at least 10 characters long');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/summarize', {
        text,
        length: options.length,
        style: options.style,
        complexity: options.complexity
      });
      
      setResult(response.data);
      // Reset queue status if successful
      setQueueStatus({ isInQueue: false, queuePosition: 0 });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Check if this is a rate limit error with queue position
        if (error.response.status === 429 && error.response.data?.queuePosition) {
          // We're in queue
          setQueueStatus({
            isInQueue: true,
            queuePosition: error.response.data.queuePosition
          });
          setError(`Rate limit exceeded. You're in queue position ${error.response.data.queuePosition}.`);
        } else {
          // Other errors
          setError(error.response.data?.error || 'An error occurred while summarizing');
        }
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      // Only set loading to false if we're not in queue
      if (!queueStatus.isInQueue) {
        setIsLoading(false);
      }
    }
  };
  
  // Function to save the last request for retry
  const saveLastRequest = (text: string, options: SummarizeOptions) => {
    localStorage.setItem('lastText', text);
    localStorage.setItem('lastLength', options.length);
    localStorage.setItem('lastStyle', options.style);
    localStorage.setItem('lastComplexity', options.complexity.toString());
  };
  
  // Modified summarize function that saves the request
  const summarizeWithRetry = async (text: string, options: SummarizeOptions) => {
    // Save request parameters for retry
    saveLastRequest(text, options);
    // Call the original summarize function
    await summarize(text, options);
  };
  
  return { 
    isLoading, 
    error, 
    result, 
    summarize: summarizeWithRetry,
    isInQueue: queueStatus.isInQueue,
    queuePosition: queueStatus.queuePosition
  };
}
