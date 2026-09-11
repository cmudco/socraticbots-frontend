interface BotOwner {
  createdById: number;
}
interface Viewer {
  id: number;
}

export function canViewBotMessageDetails(bot?: BotOwner | null, viewer?: Viewer | null): boolean {
  return bot != null && viewer != null && bot.createdById === viewer.id;
}
