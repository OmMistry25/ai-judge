import type { LLMResponse } from './types';
import { LLMResponseSchema } from './types';

// LLM Configuration
export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'google';
  model: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

// LLM Request
export interface LLMRequest {
  systemPrompt: string;
  userPrompt: string;
  config: LLMConfig;
}

// LLM Result
export interface LLMResult {
  success: boolean;
  response?: LLMResponse;
  error?: string;
  latencyMs?: number;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// LLM Provider Interface
export interface LLMProvider {
  name: string;
  evaluate(request: LLMRequest): Promise<LLMResult>;
}

// OpenAI Implementation
export class OpenAIProvider implements LLMProvider {
  name = 'openai';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async evaluate(request: LLMRequest): Promise<LLMResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.config.model,
          messages: [
            { role: 'system', content: request.systemPrompt },
            { role: 'user', content: request.userPrompt }
          ],
          temperature: request.config.temperature || 0.1,
          max_tokens: request.config.maxTokens || 1000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `OpenAI API error: ${response.status} ${errorText}`,
          latencyMs: Date.now() - startTime,
        };
      }

      const result = await response.json() as any;
      const aiResponse = result.choices[0]?.message?.content;

      if (!aiResponse) {
        return {
          success: false,
          error: 'No response from OpenAI',
          latencyMs: Date.now() - startTime,
        };
      }

      // Parse the AI response
      let parsedResponse: LLMResponse;
      try {
        parsedResponse = LLMResponseSchema.parse(JSON.parse(aiResponse));
      } catch (parseError) {
        // Try to extract JSON from the response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsedResponse = LLMResponseSchema.parse(JSON.parse(jsonMatch[0]));
          } catch (extractError) {
            return {
              success: false,
              error: `Failed to parse AI response: ${aiResponse}`,
              latencyMs: Date.now() - startTime,
            };
          }
        } else {
          return {
            success: false,
            error: `Failed to parse AI response: ${aiResponse}`,
            latencyMs: Date.now() - startTime,
          };
        }
      }

      return {
        success: true,
        response: parsedResponse,
        latencyMs: Date.now() - startTime,
        usage: {
          promptTokens: result.usage?.prompt_tokens || 0,
          completionTokens: result.usage?.completion_tokens || 0,
          totalTokens: result.usage?.total_tokens || 0,
        },
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        latencyMs: Date.now() - startTime,
      };
    }
  }
}

// Mock Implementation (for testing)
export class MockLLMProvider implements LLMProvider {
  name = 'mock';
  private delay: number;

  constructor(delay: number = 1000) {
    this.delay = delay;
  }

  async evaluate(request: LLMRequest): Promise<LLMResult> {
    const startTime = Date.now();
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, this.delay));
    
    // Generate mock response based on some simple logic
    const verdicts: Array<'pass' | 'fail' | 'inconclusive'> = ['pass', 'fail', 'inconclusive'];
    const verdict = verdicts[Math.floor(Math.random() * verdicts.length)];
    
    const reasoning = `Mock evaluation: This is a placeholder response for testing. The AI judge would evaluate: "${request.userPrompt.substring(0, 100)}..." and provide a ${verdict} verdict.`;
    
    return {
      success: true,
      response: {
        verdict,
        reasoning,
      },
      latencyMs: Date.now() - startTime,
      usage: {
        promptTokens: Math.floor(request.systemPrompt.length / 4) + Math.floor(request.userPrompt.length / 4),
        completionTokens: Math.floor(reasoning.length / 4),
        totalTokens: Math.floor((request.systemPrompt.length + request.userPrompt.length + reasoning.length) / 4),
      },
    };
  }
}

// LLM Factory
export class LLMFactory {
  static createProvider(config: LLMConfig, apiKey?: string): LLMProvider {
    switch (config.provider) {
      case 'openai':
        if (!apiKey) {
          throw new Error('OpenAI API key is required');
        }
        return new OpenAIProvider(apiKey);
      
      case 'anthropic':
        // TODO: Implement Anthropic provider
        throw new Error('Anthropic provider not implemented yet');
      
      case 'google':
        // TODO: Implement Google provider
        throw new Error('Google provider not implemented yet');
      
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
  }

  static createMockProvider(delay?: number): LLMProvider {
    return new MockLLMProvider(delay);
  }
}

// Utility functions
export function validateLLMResponse(response: any): response is LLMResponse {
  try {
    LLMResponseSchema.parse(response);
    return true;
  } catch {
    return false;
  }
}

export function createLLMRequest(
  systemPrompt: string,
  userPrompt: string,
  config: LLMConfig
): LLMRequest {
  return {
    systemPrompt,
    userPrompt,
    config,
  };
}

// Default configurations
export const DEFAULT_CONFIGS: Record<string, LLMConfig> = {
  'gpt-4': {
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.1,
    maxTokens: 1000,
    timeout: 30000,
  },
  'gpt-3.5-turbo': {
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    temperature: 0.1,
    maxTokens: 1000,
    timeout: 30000,
  },
  'claude-3': {
    provider: 'anthropic',
    model: 'claude-3-sonnet-20240229',
    temperature: 0.1,
    maxTokens: 1000,
    timeout: 30000,
  },
};
