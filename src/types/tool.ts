export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon?: string;
  enabled: boolean;
}

export interface ToolInput {
  [key: string]: any;
}

export interface ToolOutput {
  id: string;
  toolId: string;
  userId?: string;
  input: ToolInput;
  output: any;
  metadata: {
    tokensUsed?: number;
    processingTime?: number;
    model?: string;
  };
  createdAt: Date;
}

export interface ToolModule {
  config: ToolConfig;
  generatePrompt: (input: ToolInput) => string;
  processResponse: (response: string) => any;
  validateInput: (input: ToolInput) => boolean;
}
