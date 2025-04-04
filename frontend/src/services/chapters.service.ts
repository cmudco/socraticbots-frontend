// src/services/chapters.service.ts
import { api } from './api/instance';
import { AIModel } from './models.service';
import axios, { AxiosError } from 'axios';
import { ChapterFile } from './files.service';

export interface ModelPreference {
  id: string;
  chat_model?: AIModel;
  tracking_model?: AIModel;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: string;
  title: string;
  subject: string;
  topic: string;
  model_preference?: ModelPreference;
  prompts?: ChapterPrompt;
  learning_goals ?: LearningGoal[];
  files?: ChapterFile[]; 
  created_at: string;
  updated_at: string;
}

export interface LearningGoal {
  id: string;
  title: string;
  order: number;
  subgoals: SubGoal[];
  chapter_id: string;
  created_at: string;
  updated_at: string;
}

export interface SubGoal {
  id: string;
  title: string;
  order: number;
  parent_goal_id: string;
  created_at: string;
  updated_at: string;
}

export interface ChapterPrompt {
  id: string;
  greeting: string;
  chat_prompt: string;
  tracking_prompt: string;
  created_at: string;
  updated_at: string;
}

export interface CreateChapterRequest {
  title: string;
  subject: string;
  topic: string;
}

export interface UpdateChapterRequest {
  title?: string;
  subject?: string;
  topic?: string;
}

export interface ChapterModelPreferenceRequest {
  chat_model_id?: string;
  tracking_model_id?: string;
}

export interface ChapterPromptRequest {
  greeting?: string;
  chat_prompt?: string;
  tracking_prompt?: string;
}

export interface CreateLearningGoalRequest {
  title: string;
  order?: number;
}

export interface UpdateLearningGoalRequest {
  title?: string;
  order?: number;
}

export interface CreateSubGoalRequest {
  title: string;
  order?: number;
}

export interface UpdateSubGoalRequest {
  title?: string;
  order?: number;
}

export interface ReorderGoalsRequest {
  id: string;
  order: number;
}

class ChapterService {
  // Get all chapters for a specific book
  async getChapters(bookId: string): Promise<Chapter[]> {
    try {
      const response = await api.get<Chapter[]>(`/books/${bookId}/chapters/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chapters:', error);
      throw error;
    }
  }
  
  // Get a single chapter by ID for a specific book
  async getChapter(bookId: string, chapterId: string): Promise<Chapter> {
    try {
      const response = await api.get<Chapter>(`/books/${bookId}/chapters/${chapterId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching chapter ${chapterId}:`, error);
      throw error;
    }
  }
  
  // Create a new chapter for a book
  async createChapter(
      bookId: string, 
      chapterData: CreateChapterRequest, 
      modelPreferences?: ChapterModelPreferenceRequest,
      promptData?: ChapterPromptRequest  // Add this parameter
    ): Promise<Chapter> {
      try {
        // First create the chapter
        const response = await api.post<Chapter>(`/books/${bookId}/chapters/`, chapterData);
        const newChapter = response.data;
        
        // Track if we need to fetch the updated chapter
        let needsRefetch = false;
        
        // If model preferences are provided, set them
        if (modelPreferences && (modelPreferences.chat_model_id || modelPreferences.tracking_model_id)) {
          await this.setChapterModelPreferences(bookId, newChapter.id, modelPreferences);
          needsRefetch = true;
        }
        
        // Add this block for prompts
        if (promptData && (promptData.greeting || promptData.chat_prompt || promptData.tracking_prompt)) {
          await this.setChapterPrompts(bookId, newChapter.id, promptData);
          needsRefetch = true;
        }
        
        // Fetch the updated chapter if needed
        if (needsRefetch) {
          return await this.getChapter(bookId, newChapter.id);
        }
        
        return newChapter;
      } catch (error) {
        console.error('Error creating chapter:', error);
        throw error;
      }
    }
  
  // Update a chapter
  async updateChapter(
    bookId: string, 
    chapterId: string, 
    chapterData: UpdateChapterRequest,
    modelPreferences?: ChapterModelPreferenceRequest,
    promptData?: ChapterPromptRequest  // Add this parameter
  ): Promise<Chapter> {
    try {
      // Update the chapter basic info
      const response = await api.patch<Chapter>(
        `/books/${bookId}/chapters/${chapterId}/`, 
        chapterData
      );
      
      // Track if we need to fetch the updated chapter
      let needsRefetch = false;
      
      // If model preferences are provided, update them
      if (modelPreferences && (modelPreferences.chat_model_id || modelPreferences.tracking_model_id)) {
        await this.setChapterModelPreferences(bookId, chapterId, modelPreferences);
        needsRefetch = true;
      }
      
      // Add this block for prompts
      if (promptData && (promptData.greeting || promptData.chat_prompt || promptData.tracking_prompt)) {
        await this.setChapterPrompts(bookId, chapterId, promptData);
        needsRefetch = true;
      }
      
      // Fetch the updated chapter if needed
      if (needsRefetch) {
        return await this.getChapter(bookId, chapterId);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error updating chapter ${chapterId}:`, error);
      throw error;
    }
  }
  
  // Set model preferences for a chapter
  async setChapterModelPreferences(
    bookId: string,
    chapterId: string,
    preferences: ChapterModelPreferenceRequest
  ): Promise<ModelPreference> {
    try {
      const response = await api.post<ModelPreference>(
        `/books/${bookId}/chapters/${chapterId}/model-preferences/`,
        preferences
      );
      return response.data;
    } catch (error) {
      // Fix the error handling with proper type checking
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.response && axiosError.response.status === 404) {
          // If 404, try PUT instead (for updating existing preferences)
          try {
            const response = await api.put<ModelPreference>(
              `/books/${bookId}/chapters/${chapterId}/model-preferences/`,
              preferences
            );
            return response.data;
          } catch (putError) {
            console.error(`Error updating model preferences for chapter ${chapterId}:`, putError);
            throw putError;
          }
        }
      }
      console.error(`Error setting model preferences for chapter ${chapterId}:`, error);
      throw error;
    }
  }
  
  // Get model preferences for a chapter
  async getChapterModelPreferences(
    bookId: string,
    chapterId: string
  ): Promise<ModelPreference> {
    try {
      const response = await api.get<ModelPreference>(
        `/books/${bookId}/chapters/${chapterId}/model-preferences/`
      );
      return response.data;
    } catch (error) {
      console.error(`Error getting model preferences for chapter ${chapterId}:`, error);
      throw error;
    }
  }
  
  // Delete a chapter
  async deleteChapter(bookId: string, chapterId: string): Promise<void> {
    try {
      await api.delete(`/books/${bookId}/chapters/${chapterId}/`);
    } catch (error) {
      console.error(`Error deleting chapter ${chapterId}:`, error);
      throw error;
    }
  }

  // Get prompts for a chapter
  async getChapterPrompts(
    bookId: string,
    chapterId: string
  ): Promise<ChapterPrompt> {
    try {
      const response = await api.get<ChapterPrompt>(
        `/books/${bookId}/chapters/${chapterId}/prompts/`
      );
      return response.data;
    } catch (error) {
      console.error(`Error getting prompts for chapter ${chapterId}:`, error);
      throw error;
    }
  }

  // Set prompts for a chapter
  async setChapterPrompts(
    bookId: string,
    chapterId: string,
    promptData: ChapterPromptRequest
  ): Promise<ChapterPrompt> {
    try {
      const response = await api.post<ChapterPrompt>(
        `/books/${bookId}/chapters/${chapterId}/prompts/`,
        promptData
      );
      return response.data;
    } catch (error) {
      // Similar to model preferences, try PUT if POST fails with 404
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.response && axiosError.response.status === 404) {
          try {
            const response = await api.put<ChapterPrompt>(
              `/books/${bookId}/chapters/${chapterId}/prompts/`,
              promptData
            );
            return response.data;
          } catch (putError) {
            console.error(`Error updating prompts for chapter ${chapterId}:`, putError);
            throw putError;
          }
        }
      }
      console.error(`Error setting prompts for chapter ${chapterId}:`, error);
      throw error;
    }
  }

  // Get learning goals for a chapter
  async getLearningGoals(bookId: string, chapterId: string): Promise<LearningGoal[]> {
    try {
      const response = await api.get<LearningGoal[]>(
        `/books/${bookId}/chapters/${chapterId}/learning-goals/`
      );
      return response.data;
    } catch (error) {
      console.error(`Error getting learning goals for chapter ${chapterId}:`, error);
      throw error;
    }
  }

  // Get a specific learning goal
  async getLearningGoal(
    bookId: string, 
    chapterId: string, 
    goalId: string
  ): Promise<LearningGoal> {
    try {
      const response = await api.get<LearningGoal>(
        `/books/${bookId}/chapters/${chapterId}/learning-goals/${goalId}/`
      );
      return response.data;
    } catch (error) {
      console.error(`Error getting learning goal ${goalId}:`, error);
      throw error;
    }
  }

  // Create a learning goal
  async createLearningGoal(
    bookId: string,
    chapterId: string,
    goalData: CreateLearningGoalRequest
  ): Promise<LearningGoal> {
    try {
      const response = await api.post<LearningGoal>(
        `/books/${bookId}/chapters/${chapterId}/learning-goals/`,
        goalData
      );
      return response.data;
    } catch (error) {
      console.error(`Error creating learning goal for chapter ${chapterId}:`, error);
      throw error;
    }
  }

  // Update a learning goal
  async updateLearningGoal(
    bookId: string,
    chapterId: string,
    goalId: string,
    goalData: UpdateLearningGoalRequest
  ): Promise<LearningGoal> {
    try {
      const response = await api.put<LearningGoal>(
        `/books/${bookId}/chapters/${chapterId}/learning-goals/${goalId}/`,
        goalData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating learning goal ${goalId}:`, error);
      throw error;
    }
  }

  // Delete a learning goal
  async deleteLearningGoal(
    bookId: string,
    chapterId: string,
    goalId: string
  ): Promise<void> {
    try {
      await api.delete(
        `/books/${bookId}/chapters/${chapterId}/learning-goals/${goalId}/`
      );
    } catch (error) {
      console.error(`Error deleting learning goal ${goalId}:`, error);
      throw error;
    }
  }

  // Reorder learning goals
  async reorderLearningGoals(
    bookId: string,
    chapterId: string,
    reorderData: ReorderGoalsRequest[]
  ): Promise<LearningGoal[]> {
    try {
      const response = await api.post<LearningGoal[]>(
        `/books/${bookId}/chapters/${chapterId}/learning-goals/reorder/`,
        reorderData
      );
      return response.data;
    } catch (error) {
      console.error(`Error reordering learning goals for chapter ${chapterId}:`, error);
      throw error;
    }
  }

  // Create a subgoal
  async createSubGoal(
    bookId: string,
    chapterId: string,
    goalId: string,
    subgoalData: CreateSubGoalRequest
  ): Promise<SubGoal> {
    try {
      const response = await api.post<SubGoal>(
        `/books/${bookId}/chapters/${chapterId}/learning-goals/${goalId}/subgoals/`,
        subgoalData
      );
      return response.data;
    } catch (error) {
      console.error(`Error creating subgoal for goal ${goalId}:`, error);
      throw error;
    }
  }

  // Update a subgoal
  async updateSubGoal(
    bookId: string,
    chapterId: string,
    goalId: string,
    subgoalId: string,
    subgoalData: UpdateSubGoalRequest
  ): Promise<SubGoal> {
    try {
      const response = await api.put<SubGoal>(
        `/books/${bookId}/chapters/${chapterId}/learning-goals/${goalId}/subgoals/${subgoalId}/`,
        subgoalData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating subgoal ${subgoalId}:`, error);
      throw error;
    }
  }

  // Delete a subgoal
  async deleteSubGoal(
    bookId: string,
    chapterId: string,
    goalId: string,
    subgoalId: string
  ): Promise<void> {
    try {
      await api.delete(
        `/books/${bookId}/chapters/${chapterId}/learning-goals/${goalId}/subgoals/${subgoalId}/`
      );
    } catch (error) {
      console.error(`Error deleting subgoal ${subgoalId}:`, error);
      throw error;
    }
  }

  
  
}

// Export a singleton instance
export const chapterService = new ChapterService();
