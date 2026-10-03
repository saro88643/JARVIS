export type AIRole = 'system' | 'user' | 'assistant' | 'tool';

export interface AIChatMessage {
  role: AIRole;
  content: string;
  name?: string;
  toolCalls?: AIToolCall[];
  toolCallId?: string;
}

export interface AIToolCall {
  id: string;
  toolName: string;
  args: Record<string, any>;
}

export interface AIToolDeclaration {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface AICompletionOptions {
  temperature?: number;
  maxTokens?: number;
  systemInstruction?: string;
  tools?: AIToolDeclaration[];
  model?: string;
}

export interface AICompletionResponse {
  content: string;
  role: 'assistant';
  model: string;
  provider: string;
  finishReason?: 'stop' | 'tool_calls' | 'length' | 'content_filter' | 'error';
  toolCalls?: AIToolCall[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIProviderConfig {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

export interface AIProvider {
  readonly id: string;
  readonly name: string;
  readonly defaultModel: string;
  
  isConfigured(): boolean;
  generateResponse(messages: AIChatMessage[], options?: AICompletionOptions): Promise<AICompletionResponse>;
}
