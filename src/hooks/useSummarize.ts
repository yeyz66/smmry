import { useState } from 'react';
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

export default function useSummarize() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SummaryResult | null>(null);
  
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
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || 'Failed to summarize text');
      } else {
        setError('An unexpected error occurred');
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const reset = () => {
    setResult(null);
    setError(null);
  };
  
  return {
    summarize,
    reset,
    isLoading,
    error,
    result
  };
}
