import { OpenAIModel } from './openai';

export interface Message {
  role: Role;
  name: string;
  content: string;
  function_call?: FunctionCall;
}

export interface FunctionCall {
  name: string;
  arguments: string;
}

export type Role = 'assistant' | 'user' | 'function';

export interface ChatBody {
  model: OpenAIModel;
  messages: Message[];
  key: string;
  prompt: string;
  temperature: number;
}

export interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  model: OpenAIModel;
  prompt: string;
  temperature: number;
  folderId: string | null;
}
