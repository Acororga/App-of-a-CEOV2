import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Briefcase, Heart, Dumbbell, BookOpen, ShoppingBag, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';

const categoryIcons = {
  work: Briefcase,
  health: Heart,
  fitness: Dumbbell,
  learning: BookOpen,
  personal: ShoppingBag,
  social: Users
};

export default function OnboardingQuestionnaire({ onComplete }) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    mainGoals: '',
    habitCategories: [],
    workType: '',
    challenges: '',
    idealDay: ''
  });

  const categories = [
    { id: 'work', label: 'Work & Career', icon: Briefcase },
    { id: 'health', label: 'Health & Wellness', icon: Heart },
    { id: 'fitness', label: 'Fitness & Sports', icon: Dumbbell },
    { id: 'learning', label: 'Learning & Growth', icon: BookOpen },
    { id: 'personal', label: 'Personal Projects', icon: ShoppingBag },
    { id: 'social', label: 'Social & Family', icon: Users }
  ];

  const toggleCategory = (id) => {
    setFormData(prev => ({
      ...prev,
      habitCategories: prev.habitCategories.includes(id)
        ? prev.habitCategories.filter(c => c !== id)
        : [...prev.habitCategories, id]
    }));
  };

  const handleComplete = async () => {
    try {
      const user = await base44.auth.me();
      await base44.auth.updateMe({
        onboarding_data: formData
      });
      onComplete();
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      onComplete();
    }
  };

  const steps = [
    {
      title: "What are your main goals?",
      description: "Tell us what you want to achieve. This helps us personalize your experience.",
      content: (
        <Textarea
          value={formData.mainGoals}
          onChange={(e) => setFormData({ ...formData, mainGoals: e.target.value })}
          placeholder="e.g., Launch my business, get fit, learn Spanish..."
          className="bg-zinc-900 border-zinc-800 text-white h-32 resize-none"
        />
      )
    },
    {
      title: "Which areas matter most?",
      description: "Select the categories you want to focus on.",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isSelected = formData.habitCategories.includes(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'bg-white text-black border-white'
                    : 'bg-zinc-900 border-zinc-800 text-white hover:border-zinc-700'
                }`}
              >
                <Icon className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">{cat.label}</div>
              </button>
            );
          })}
        </div>
      )
    },
    {
      title: "What do you do professionally?",
      description: "This helps us suggest relevant tasks and habits.",
      content: (
        <Input
          value={formData.workType}
          onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
          placeholder="e.g., Entrepreneur, Student, Engineer..."
          className="bg-zinc-900 border-zinc-800 text-white"
        />
      )
    },
    {
      title: "What's your biggest challenge?",
      description: "Understanding your obstacles helps us support you better.",
      content: (
        <Textarea
          value={formData.challenges}
          onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
          placeholder="e.g., Staying focused, managing time, building consistency..."
          className="bg-zinc-900 border-zinc-800 text-white h-32 resize-none"
        />
      )
    },
    {
      title: "Describe your ideal day",
      description: "What does a perfect, productive day look like for you?",
      content: (
        <Textarea
          value={formData.idealDay}
          onChange={(e) => setFormData({ ...formData, idealDay: e.target.value })}
          placeholder="e.g., Wake up early, workout, deep work sessions, evening relaxation..."
          className="bg-zinc-900 border-zinc-800 text-white h-32 resize-none"
        />
      )
    }
  ];

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Progress */}
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 rounded-full flex-1 transition-all ${
                    index <= step ? 'bg-white' : 'bg-zinc-800'
                  }`}
                />
              ))}
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{currentStep.title}</h2>
                <p className="text-zinc-400">{currentStep.description}</p>
              </div>
              {currentStep.content}
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              {step > 0 && (
                <Button
                  onClick={() => setStep(step - 1)}
                  variant="outline"
                  className="flex-1 bg-zinc-900 border-zinc-800 hover:bg-zinc-800"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={() => {
                  if (step === steps.length - 1) {
                    handleComplete();
                  } else {
                    setStep(step + 1);
                  }
                }}
                className="flex-1 bg-white text-black hover:bg-zinc-200"
              >
                {step === steps.length - 1 ? 'Complete' : 'Next'}
                {step !== steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>

            {/* Skip option */}
            {step === 0 && (
              <button
                onClick={onComplete}
                className="w-full text-center text-sm text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                Skip for now
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}