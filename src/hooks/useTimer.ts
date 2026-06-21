// Timer Hook for Speaker 3-minute limit
import { useState, useEffect, useRef } from 'react';

export const useSpeakerTimer = (
  isActive: boolean,
  duration: number = 180, // 3 minutes in seconds
  onComplete?: () => void
) => {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      // Reset timer when activated
      setTimeRemaining(duration);

      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            if (onComplete) {
              onComplete();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Clear interval when not active
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, duration, onComplete]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return {
    timeRemaining,
    minutes,
    seconds,
    formattedTime: `${minutes}:${seconds.toString().padStart(2, '0')}`,
    isExpired: timeRemaining === 0,
  };
};
