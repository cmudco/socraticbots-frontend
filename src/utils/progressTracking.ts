interface ProgressConfiguration {
  modelPreference?: { trackingModelDareId?: string | null };
  prompts?: { learningGoals?: string | null; trackingPrompt?: string | null };
}

export function isProgressTrackingConfigured(bot?: ProgressConfiguration | null): boolean {
  return Boolean(
    bot?.modelPreference?.trackingModelDareId &&
      bot.prompts?.learningGoals?.trim() &&
      bot.prompts?.trackingPrompt?.trim()
  );
}
