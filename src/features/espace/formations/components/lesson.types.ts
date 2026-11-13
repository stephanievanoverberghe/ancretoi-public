export type LessonInitialState = {
  data: Record<string, string>;
  practiced: boolean;
  completed: boolean;
  lastSavedAt: string | null;
  version: string | null;
};

export type LearnerFormField = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'slider' | 'select' | 'boolean';
  required: boolean;
  min?: number;
  max?: number;
  options?: string[];
  groupTitle?: string;
};
