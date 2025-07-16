import { METHOD } from '@/constants/requests';

import { baseRequest } from '@/utils/baseRequest';

import { ChapterFile } from '@/types/file';

import { AIModel } from './models.service';

export interface AccessCode {
  code: string;
  target_name: string;
  target_type: string;
  created_at: string;
}

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
  learning_goals?: LearningGoal[];
  files?: ChapterFile[];
  access_code?: AccessCode | null;
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
  learning_goals: string;
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
  learning_goals?: string;
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
  async getChapters(bookId: string): Promise<Chapter[]> {
    return baseRequest<Chapter[]>({
      url: `books/${bookId}/chapters/`,
      method: METHOD.GET,
    });
  }

  async getChapter(bookId: string, chapterId: string): Promise<Chapter> {
    return baseRequest<Chapter>({
      url: `books/${bookId}/chapters/${chapterId}/`,
      method: METHOD.GET,
    });
  }

  async createChapter(
    bookId: string,
    chapterData: CreateChapterRequest,
    modelPreferences?: ChapterModelPreferenceRequest,
    promptData?: ChapterPromptRequest
  ): Promise<Chapter> {
    try {
      const newChapter = await baseRequest<Chapter>({
        url: `books/${bookId}/chapters/`,
        method: METHOD.POST,
        data: chapterData,
      });

      let needsRefetch = false;

      if (
        modelPreferences &&
        (modelPreferences.chat_model_id || modelPreferences.tracking_model_id)
      ) {
        await this.setChapterModelPreferences(bookId, newChapter.id, modelPreferences);
        needsRefetch = true;
      }

      if (
        promptData &&
        (promptData.greeting || promptData.chat_prompt || promptData.tracking_prompt)
      ) {
        await this.setChapterPrompts(bookId, newChapter.id, promptData);
        needsRefetch = true;
      }

      if (needsRefetch) {
        return await this.getChapter(bookId, newChapter.id);
      }

      return newChapter;
    } catch (error) {
      console.error('Error creating chapter:', error);
      throw error;
    }
  }

  async updateChapter(
    bookId: string,
    chapterId: string,
    chapterData: UpdateChapterRequest,
    modelPreferences?: ChapterModelPreferenceRequest,
    promptData?: ChapterPromptRequest
  ): Promise<Chapter> {
    try {
      const updatedChapter = await baseRequest<Chapter>({
        url: `books/${bookId}/chapters/${chapterId}/`,
        method: METHOD.PATCH,
        data: chapterData,
      });

      let needsRefetch = false;

      if (
        modelPreferences &&
        (modelPreferences.chat_model_id || modelPreferences.tracking_model_id)
      ) {
        await this.setChapterModelPreferences(bookId, chapterId, modelPreferences);
        needsRefetch = true;
      }

      if (
        promptData &&
        (promptData.greeting || promptData.chat_prompt || promptData.tracking_prompt)
      ) {
        await this.setChapterPrompts(bookId, chapterId, promptData);
        needsRefetch = true;
      }

      if (needsRefetch) {
        return await this.getChapter(bookId, chapterId);
      }

      return updatedChapter;
    } catch (error) {
      console.error(`Error updating chapter ${chapterId}:`, error);
      throw error;
    }
  }

  async setChapterModelPreferences(
    bookId: string,
    chapterId: string,
    preferences: ChapterModelPreferenceRequest
  ): Promise<ModelPreference> {
    return baseRequest<ModelPreference>({
      url: `books/${bookId}/chapters/${chapterId}/model-preferences/`,
      method: METHOD.POST,
      data: preferences,
    });
  }

  async getChapterModelPreferences(bookId: string, chapterId: string): Promise<ModelPreference> {
    return baseRequest<ModelPreference>({
      url: `books/${bookId}/chapters/${chapterId}/model-preferences/`,
      method: METHOD.GET,
    });
  }

  async deleteChapter(bookId: string, chapterId: string): Promise<void> {
    await baseRequest<void>({
      url: `books/${bookId}/chapters/${chapterId}/`,
      method: METHOD.DELETE,
    });
  }

  async getChapterPrompts(bookId: string, chapterId: string): Promise<ChapterPrompt> {
    return baseRequest<ChapterPrompt>({
      url: `books/${bookId}/chapters/${chapterId}/prompts/`,
      method: METHOD.GET,
    });
  }

  async setChapterPrompts(
    bookId: string,
    chapterId: string,
    promptData: ChapterPromptRequest
  ): Promise<ChapterPrompt> {
    return baseRequest<ChapterPrompt>({
      url: `books/${bookId}/chapters/${chapterId}/prompts/`,
      method: METHOD.POST,
      data: promptData,
    });
  }

  async getLearningGoals(bookId: string, chapterId: string): Promise<LearningGoal[]> {
    return baseRequest<LearningGoal[]>({
      url: `books/${bookId}/chapters/${chapterId}/learning-goals/`,
      method: METHOD.GET,
    });
  }

  async getLearningGoal(bookId: string, chapterId: string, goalId: string): Promise<LearningGoal> {
    return baseRequest<LearningGoal>({
      url: `books/${bookId}/chapters/${chapterId}/learning-goals/${goalId}/`,
      method: METHOD.GET,
    });
  }

  async createLearningGoal(
    bookId: string,
    chapterId: string,
    goalData: CreateLearningGoalRequest
  ): Promise<LearningGoal> {
    return baseRequest<LearningGoal>({
      url: `books/${bookId}/chapters/${chapterId}/learning-goals/`,
      method: METHOD.POST,
      data: goalData,
    });
  }

  async updateLearningGoal(
    bookId: string,
    chapterId: string,
    goalId: string,
    goalData: UpdateLearningGoalRequest
  ): Promise<LearningGoal> {
    return baseRequest<LearningGoal>({
      url: `books/${bookId}/chapters/${chapterId}/learning-goals/${goalId}/`,
      method: METHOD.PUT,
      data: goalData,
    });
  }

  async deleteLearningGoal(bookId: string, chapterId: string, goalId: string): Promise<void> {
    await baseRequest<void>({
      url: `books/${bookId}/chapters/${chapterId}/learning-goals/${goalId}/`,
      method: METHOD.DELETE,
    });
  }

  async reorderLearningGoals(
    bookId: string,
    chapterId: string,
    reorderData: ReorderGoalsRequest[]
  ): Promise<LearningGoal[]> {
    return baseRequest<LearningGoal[]>({
      url: `books/${bookId}/chapters/${chapterId}/learning-goals/reorder/`,
      method: METHOD.POST,
      data: reorderData,
    });
  }

  async createSubGoal(
    bookId: string,
    chapterId: string,
    goalId: string,
    subgoalData: CreateSubGoalRequest
  ): Promise<SubGoal> {
    return baseRequest<SubGoal>({
      url: `books/${bookId}/chapters/${chapterId}/learning-goals/${goalId}/subgoals/`,
      method: METHOD.POST,
      data: subgoalData,
    });
  }

  async updateSubGoal(
    bookId: string,
    chapterId: string,
    goalId: string,
    subgoalId: string,
    subgoalData: UpdateSubGoalRequest
  ): Promise<SubGoal> {
    return baseRequest<SubGoal>({
      url: `books/${bookId}/chapters/${chapterId}/learning-goals/${goalId}/subgoals/${subgoalId}/`,
      method: METHOD.PUT,
      data: subgoalData,
    });
  }

  async deleteSubGoal(
    bookId: string,
    chapterId: string,
    goalId: string,
    subgoalId: string
  ): Promise<void> {
    await baseRequest<void>({
      url: `books/${bookId}/chapters/${chapterId}/learning-goals/${goalId}/subgoals/${subgoalId}/`,
      method: METHOD.DELETE,
    });
  }
}

export const chapterService = new ChapterService();
