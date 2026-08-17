import { z } from 'zod';

// ============================================================================
// Step Schemas - Each step has its own validation
// ============================================================================

/** Step 1: Basic Info (required fields) */
export const basicInfoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().min(1, 'Topic is required'),
  // Opaque DARE picker id ("42" or "litellm:<key>:<name>"). See PickerModel.
  chatModelDareId: z.string().min(1).nullable(),
  trackingModelDareId: z.string().min(1).nullable(),
  isActive: z.boolean(),
  webSearchEnabled: z.boolean(),
  // 'naive'/'advanced' both mean classic pre-injected retrieval for Socratic
  // bots; 'agentic' lets the model search documents on demand via tools.
  ragMode: z.enum(['naive', 'advanced', 'agentic']),
  isAdvanced: z.boolean(),
});

/** Step 2: Prompts (all optional, but typed as strings) */
export const promptsSchema = z.object({
  greeting: z.string(),
  chatPrompt: z.string(),
  trackingPrompt: z.string(),
  learningGoals: z.string(),
});

/** Step 3: Quick Prompts (array of prompt templates) */
export const quickPromptItemSchema = z.object({
  id: z.number().optional(),
  title: z.string(),
  prompt: z.string(),
  order: z.number(),
});

export const quickPromptsSchema = z.object({
  quickPrompts: z.array(quickPromptItemSchema),
});

/** Step 4: Theme (colors and styling) */
export const themeSchema = z.object({
  primaryColor: z.string(),
  accentColor: z.string(),
  backgroundColor: z.string(),
  foregroundColor: z.string(),
  fontFamily: z.enum(['sans', 'serif', 'mono']),
  fontSize: z.enum(['xs', 'sm', 'base', 'lg', 'xl']),
  borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'xl']),
  messageSpacing: z.enum(['compact', 'normal', 'relaxed']),
});

/** Step 5: Deployment (subscription codes and public settings) */
export const deploymentSchema = z.object({
  accessCode: z.string(),
  accessCodeLimit: z.number(),
  isPubliclyDeployed: z.boolean(),
  budget: z.string(),
});

// ============================================================================
// Full Form Schema - Combines all steps
// ============================================================================

export const botFormSchema = basicInfoSchema
  .merge(promptsSchema)
  .merge(quickPromptsSchema)
  .merge(themeSchema)
  .merge(deploymentSchema);

/** Full form data type - inferred from Zod schema */
export type BotFormData = z.infer<typeof botFormSchema>;

/** Quick prompt item type */
export type QuickPromptItem = z.infer<typeof quickPromptItemSchema>;

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_BOT_FORM_VALUES: BotFormData = {
  // Basic Info
  title: '',
  subject: '',
  topic: '',
  chatModelDareId: null,
  trackingModelDareId: null,
  isActive: true,
  webSearchEnabled: false,
  ragMode: 'advanced',
  isAdvanced: false,
  // Prompts
  greeting: '',
  chatPrompt: '',
  trackingPrompt: '',
  learningGoals: '',
  // Quick Prompts
  quickPrompts: [],
  // Theme
  primaryColor: '#8b5cf6',
  accentColor: '#a78bfa',
  backgroundColor: '#ffffff',
  foregroundColor: '#0f172a',
  fontFamily: 'sans',
  fontSize: 'base',
  borderRadius: 'md',
  messageSpacing: 'normal',
  // Deployment
  accessCode: '',
  accessCodeLimit: 0,
  isPubliclyDeployed: false,
  budget: '',
};

// ============================================================================
// Helpers
// ============================================================================

/** Map Bot API response to form values */
export function mapBotToFormData(bot: {
  title?: string;
  subject?: string;
  topic?: string;
  modelPreference?: {
    chatModelDareId?: string | null;
    trackingModelDareId?: string | null;
  } | null;
  isActive?: boolean;
  webSearchEnabled?: boolean;
  ragMode?: 'naive' | 'advanced' | 'agentic';
  isAdvanced?: boolean;
  prompts?: {
    greeting?: string;
    chatPrompt?: string;
    trackingPrompt?: string;
    learningGoals?: string;
  } | null;
  quickPrompts?: Array<{
    id?: number;
    title: string;
    prompt: string;
    order?: number;
  }> | null;
  theme?: {
    primaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    foregroundColor?: string;
    fontFamily?: 'sans' | 'serif' | 'mono';
    fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
    borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    messageSpacing?: 'compact' | 'normal' | 'relaxed';
  } | null;
  accessCode?: { code?: string; limit?: number } | null;
  isPubliclyDeployed?: boolean;
  budget?: number | string | null;
}): BotFormData {
  return {
    // Basic Info
    title: bot.title || '',
    subject: bot.subject || '',
    topic: bot.topic || '',
    chatModelDareId: bot.modelPreference?.chatModelDareId ?? null,
    trackingModelDareId: bot.modelPreference?.trackingModelDareId ?? null,
    isActive: bot.isActive ?? true,
    webSearchEnabled: bot.webSearchEnabled ?? false,
    ragMode: bot.ragMode ?? 'advanced',
    isAdvanced: bot.isAdvanced ?? false,
    // Prompts
    greeting: bot.prompts?.greeting || '',
    chatPrompt: bot.prompts?.chatPrompt || '',
    trackingPrompt: bot.prompts?.trackingPrompt || '',
    learningGoals: bot.prompts?.learningGoals || '',
    // Quick Prompts
    quickPrompts: (bot.quickPrompts || []).map((qp, i) => ({
      id: qp.id,
      title: qp.title,
      prompt: qp.prompt,
      order: qp.order ?? i,
    })),
    // Theme
    primaryColor: bot.theme?.primaryColor || '#8b5cf6',
    accentColor: bot.theme?.accentColor || '#a78bfa',
    backgroundColor: bot.theme?.backgroundColor || '#ffffff',
    foregroundColor: bot.theme?.foregroundColor || '#0f172a',
    fontFamily: bot.theme?.fontFamily || 'sans',
    fontSize: bot.theme?.fontSize || 'base',
    borderRadius: bot.theme?.borderRadius || 'md',
    messageSpacing: bot.theme?.messageSpacing || 'normal',
    // Deployment
    accessCode: bot.accessCode?.code || '',
    accessCodeLimit: bot.accessCode?.limit ?? 0,
    isPubliclyDeployed: bot.isPubliclyDeployed ?? false,
    budget: bot.budget ? String(bot.budget) : '',
  };
}

/** Map form values to API request payload */
export function mapFormDataToPayload(data: BotFormData) {
  return {
    // Basic Info
    title: data.title,
    subject: data.subject,
    topic: data.topic,
    chatModelDareId: data.chatModelDareId,
    trackingModelDareId: data.trackingModelDareId,
    isActive: data.isActive,
    webSearchEnabled: data.webSearchEnabled,
    ragMode: data.ragMode,
    isAdvanced: data.isAdvanced,
    // Prompts
    greeting: data.greeting || undefined,
    chatPrompt: data.chatPrompt || undefined,
    trackingPrompt: data.trackingPrompt || undefined,
    learningGoals: data.learningGoals || undefined,
    // Quick Prompts
    quickPromptsData: data.quickPrompts
      .filter(qp => qp.title.trim() && qp.prompt.trim())
      .map((qp, i) => ({
        title: qp.title,
        prompt: qp.prompt,
        order: qp.order ?? i,
      })),
    // Theme
    theme: {
      primaryColor: data.primaryColor,
      accentColor: data.accentColor,
      backgroundColor: data.backgroundColor,
      foregroundColor: data.foregroundColor,
      fontFamily: data.fontFamily,
      fontSize: data.fontSize,
      borderRadius: data.borderRadius,
      messageSpacing: data.messageSpacing,
    },
    // Deployment
    accessCode: data.accessCode || undefined,
    accessCodeLimit: data.accessCodeLimit,
    isPubliclyDeployed: data.isPubliclyDeployed,
    budget: data.budget ? parseFloat(data.budget) : undefined,
  };
}
