import { useState, useEffect } from 'react';
import { TourTooltip } from './TourTooltip';

interface TourStep {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    target: 'hero-section',
    title: 'Welcome to DEPO Goal Tracker',
    description: 'Transform your ambitions into achievements with our comprehensive goal tracking system built on the DEPO framework.',
    position: 'bottom'
  },
  {
    target: 'depo-d',
    title: 'D - Define Your Goals',
    description: 'Set clear, actionable goals with our intuitive goal-setting interface. Break down big dreams into manageable milestones.',
    position: 'bottom'
  },
  {
    target: 'depo-e',
    title: 'E - Establish Your Steps',
    description: 'Establish the steps you need to take to reach your goal with our smart task management system.',
    position: 'bottom'
  },
  {
    target: 'depo-p',
    title: 'P - Prepare for Transformation',
    description: 'Prepare for the person you\'re going to become. Visualize your journey with powerful analytics and charts.',
    position: 'bottom'
  },
  {
    target: 'depo-o',
    title: 'O - Opportunities',
    description: 'Take advantage to what comes to you. Recognize and seize the opportunities that arise on your journey.',
    position: 'bottom'

  },

  {
    target: 'progress-showcase',
    title: 'Real Progress, Real Results',
    description: 'See how users achieve 87% success rate and 2.5x faster goal completion with our proven system.',
    position: 'top'
  }
];

interface ProductTourProps {
  isActive: boolean;
  onComplete: () => void;
}

export function ProductTour({ isActive, onComplete }: ProductTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isActive) return;

    const updatePosition = () => {
      const step = tourSteps[currentStep];
      const element = document.getElementById(step.target);
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const rect = element.getBoundingClientRect();
        setTooltipPosition({ top: rect.top, left: rect.left + rect.width / 2 });
        
        element.classList.add('tour-highlight');
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      const step = tourSteps[currentStep];
      const element = document.getElementById(step.target);
      if (element) element.classList.remove('tour-highlight');
    };
  }, [currentStep, isActive]);

  if (!isActive) return null;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentTourStep = tourSteps[currentStep];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onComplete} />
      <div
        className="fixed z-50"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: 'translateX(-50%)'
        }}
      >
        <TourTooltip
          title={currentTourStep.title}
          description={currentTourStep.description}
          currentStep={currentStep}
          totalSteps={tourSteps.length}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onClose={onComplete}
          position={currentTourStep.position}
        />
      </div>
    </>
  );
}
