export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  imageUrl?: string; // For motivational images
  groundingLinks?: { title: string; url: string }[]; // For Google Search results
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isOpen: boolean;
}

export enum StudyTechnique {
  POMODORO = 'Pomodoro',
  FEYNMAN = 'Feynman',
  ACTIVE_RECALL = 'Active Recall',
  SPACED_REPETITION = 'Spaced Repetition'
}
