import { useEffect, useState } from 'react';
import { Progress } from './ui/progress';

interface QueueStatusProps {
  isInQueue: boolean;
  queuePosition: number;
}

export function QueueStatus({ isInQueue, queuePosition }: QueueStatusProps) {
  const [progress, setProgress] = useState(0);
  
  // Animate progress to show activity while waiting
  useEffect(() => {
    if (!isInQueue) return;
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 10;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isInQueue]);
  
  if (!isInQueue) return null;
  
  return (
    <div className="p-4 mb-4 bg-amber-50 border border-amber-200 rounded-md">
      <h3 className="text-lg font-medium text-amber-800 mb-2">
        Rate Limit Reached
      </h3>
      <p className="text-amber-700 mb-3">
        You&apos;re in queue position {queuePosition}. We&apos;ll process your request automatically when it&apos;s your turn.
      </p>
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-amber-600">
          <span>Waiting for your turn...</span>
          <span>Queue Position: {queuePosition}</span>
        </div>
        <Progress value={progress} className="h-2 bg-amber-200" 
          indicatorClassName="bg-amber-500" />
        <p className="text-xs text-amber-600 mt-2">
          Free users are limited to {process.env.FREE_LIMIT_PER_MINUTE || 5} requests per minute across all users.
          <br />
          Consider upgrading to premium for unlimited access without waiting!
        </p>
      </div>
    </div>
  );
} 