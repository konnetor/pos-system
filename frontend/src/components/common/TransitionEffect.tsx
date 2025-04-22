
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface TransitionEffectProps {
  children: React.ReactNode;
  className?: string;
}

const TransitionEffect: React.FC<TransitionEffectProps> = ({ children, className }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('fadeOut');
    }
  }, [location, displayLocation]);

  const handleAnimationEnd = () => {
    if (transitionStage === 'fadeOut') {
      setTransitionStage('fadeIn');
      setDisplayLocation(location);
    }
  };

  return (
    <div
      className={cn(
        'w-full min-h-screen transition-opacity duration-300 ease-in-out',
        transitionStage === 'fadeIn' ? 'animate-fade-in' : 'animate-fade-out',
        className
      )}
      onAnimationEnd={handleAnimationEnd}
    >
      {children}
    </div>
  );
};

export default TransitionEffect;
