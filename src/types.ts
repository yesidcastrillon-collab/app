export type NodeId = 'finca' | 'transporte' | 'planta' | 'consumo';

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Scenario {
  id: string;
  nodeId: NodeId;
  title: string;
  description: string;
  options: Option[];
}

export interface Feedback {
  isCorrect: boolean;
  message: string;
  citation?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface AppState {
  currentNode: NodeId | null;
  currentScenario: Scenario | null;
  feedback: Feedback | null;
  quiz: QuizQuestion | null;
  quizScore: number;
  isEvaluating: boolean;
  history: string[];
}
