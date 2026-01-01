import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Sparkles, Target, Calendar, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const tutorialSteps = [
  {
    icon: Sparkles,
    title: 'Welcome to CEO App',
    description: 'Your personal productivity command center. Swipe to learn the features.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Target,
    title: 'Dashboard',
    description: 'Track your habits, validate yesterday\'s progress, and see your top priority tasks all in one place.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: TrendingUp,
    title: 'To-Do Matrix',
    description: 'Prioritize tasks by importance and time. Focus on what truly moves the needle.',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    icon: Calendar,
    title: 'Habits & Goals',
    description: 'Build lasting habits with weekly contracts, rewards, and accountability.',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    icon: Zap,
    title: 'Focus Mode',
    description: 'Activate distraction-free sessions to get deep work done. Build your win streak.',
    color: 'from-orange-500 to-red-500'
  }
];

export default function OnboardingTutorial({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const handleNext = () => {
    if (currentStep === tutorialSteps.length - 1) {
      onComplete();
    } else {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = tutorialSteps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6">
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 transition-colors"
      >
        <X className="w-5 h-5 text-zinc-400" />
      </button>

      <div className="max-w-md w-full">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            initial={{ opacity: 0, x: direction * 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -100 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Icon */}
            <div className="flex justify-center">
              <div className="relative w-32 h-32">
                {/* Matte dark container */}
                <div className="absolute inset-0 rounded-3xl"
                     style={{
                       background: '#2e2e2e',
                       boxShadow: `
                         0 4px 12px rgba(0, 0, 0, 0.4),
                         inset 0 1px 1px rgba(255, 255, 255, 0.03),
                         inset 0 -1px 1px rgba(0, 0, 0, 0.15)
                       `
                     }}
                />
                {/* Icon symbol - desaturated */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon className="w-16 h-16" style={{ color: '#9a9a9a' }} />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-white">{step.title}</h2>
              <p className="text-lg text-zinc-400 leading-relaxed">{step.description}</p>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-2">
              {tutorialSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentStep ? 1 : -1);
                    setCurrentStep(index);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep 
                      ? 'w-8 bg-white' 
                      : 'w-2 bg-zinc-700 hover:bg-zinc-600'
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button
                  onClick={handlePrev}
                  variant="outline"
                  className="flex-1 bg-zinc-900 border-zinc-800 hover:bg-zinc-800"
                >
                  Previous
                </Button>
              )}
              <Button
                onClick={handleNext}
                className={`flex-1 bg-gradient-to-r ${step.color} hover:opacity-90 text-white`}
              >
                {currentStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}
                {currentStep !== tutorialSteps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}