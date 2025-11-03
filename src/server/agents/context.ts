// src/server/agents/context.ts

import { AsyncLocalStorage } from "node:async_hooks";

interface AgentContextType {
  userId?: string;
}

export const agentContext = new AsyncLocalStorage<AgentContextType>();

// Get current userId inside tools or Mastra calls
export function getAgentUserId(): string {
  const store = agentContext.getStore();
  if (!store?.userId) {
    throw new Error("No userId found in agent context");
  }
  return store.userId;
}

