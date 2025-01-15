export interface LearningGoalProgress {
    text: string;
    understanding: number;
  }
  
  export interface LearningGoalTrackerProps {
    goals: LearningGoalProgress[];
    onGoalClick?: (index: number) => void;
  }