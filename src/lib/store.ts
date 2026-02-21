import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { QuizAnswers, GeneratedPlan } from "@/types/quiz";

interface QuizState {
  currentStep: number;
  answers: QuizAnswers;
  plan: GeneratedPlan | null;
  isGenerating: boolean;
  email: string;
  selectedPlan: string;
  _hasHydrated: boolean;
  setCurrentStep: (step: number) => void;
  setAnswer: (questionId: string, value: string | string[] | number) => void;
  setPlan: (plan: GeneratedPlan) => void;
  setIsGenerating: (generating: boolean) => void;
  setEmail: (email: string) => void;
  setSelectedPlan: (plan: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      currentStep: 0,
      answers: {},
      plan: null,
      isGenerating: false,
      email: "",
      selectedPlan: "monthly",
      _hasHydrated: false,
      setCurrentStep: (step) => set({ currentStep: step }),
      setAnswer: (questionId, value) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: value },
        })),
      setPlan: (plan) => set({ plan }),
      setIsGenerating: (generating) => set({ isGenerating: generating }),
      setEmail: (email) => set({ email }),
      setSelectedPlan: (plan) => set({ selectedPlan: plan }),
      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(0, state.currentStep - 1),
        })),
      reset: () =>
        set({
          currentStep: 0,
          answers: {},
          plan: null,
          isGenerating: false,
          email: "",
          selectedPlan: "monthly",
        }),
    }),
    {
      name: "dash-quiz-store",
      storage: createJSONStorage(() => sessionStorage),
      // Only persist the data that matters — NOT transient UI state
      partialize: (state) => ({
        currentStep: state.currentStep,
        answers: state.answers,
        email: state.email,
        selectedPlan: state.selectedPlan,
        plan: state.plan,
      }),
      onRehydrateStorage: () => {
        return () => {
          // Mark hydration complete so guards don't redirect prematurely
          useQuizStore.setState({ _hasHydrated: true });
        };
      },
    }
  )
);
