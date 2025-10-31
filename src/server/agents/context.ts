import { AsyncLocalStorage } from "async_hooks";

export const agentContext = new AsyncLocalStorage<{ userId: string }>();

// Helper to get current userId from context
export function getAgentUserId(): string {
  const ctx = agentContext.getStore();
  if (!ctx?.userId) {
    throw new Error("No userId in agent context - agent must be called with context");
  }
  return ctx.userId;
}

