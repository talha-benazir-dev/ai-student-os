export type StudyStage =
  | "high_school"
  | "undergraduate"
  | "postgraduate"
  | "self_learning";

export type Profile = {
  id: string;
  name: string;
  country: string;
  study_stage: StudyStage;
  subjects: string[];
  onboarded: boolean;
  created_at: string;
  updated_at: string;
};

export type OnboardingData = {
  name: string;
  country: string;
  study_stage: StudyStage;
  subjects: string[];
};

export type OnboardingSetupContext = {
  userId: string;
  data: OnboardingData;
};

export type OnboardingSetupStepResult = {
  step: string;
  error: string | null;
};
