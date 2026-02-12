
export interface AudioAnalysis {
  mood: string;
  energy: string;
  visualPrompt: string;
}

export enum ProcessingStep {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  DREAMING = 'DREAMING',
  PAINTING = 'PAINTING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface ProcessingState {
  step: ProcessingStep;
  progress: number;
  message: string;
  error?: string;
}
