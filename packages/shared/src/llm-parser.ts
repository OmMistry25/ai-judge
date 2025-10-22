import { LLMResponseSchema, type LLMResponse } from './types';

// Enhanced parser with better error handling
export class LLMResponseParser {
  private static readonly JSON_PATTERN = /\{[\s\S]*\}/;
  
  /**
   * Parse AI response with multiple fallback strategies
   */
  static parseResponse(rawResponse: string): {
    success: boolean;
    response?: LLMResponse;
    error?: string;
    fallbackUsed?: string;
  } {
    // Strategy 1: Direct JSON parsing
    try {
      const parsed = JSON.parse(rawResponse);
      const validated = LLMResponseSchema.parse(parsed);
      return {
        success: true,
        response: validated,
      };
    } catch (error) {
      // Strategy 2: Extract JSON from response
      try {
        const jsonMatch = rawResponse.match(this.JSON_PATTERN);
        if (jsonMatch) {
          const extracted = JSON.parse(jsonMatch[0]);
          const validated = LLMResponseSchema.parse(extracted);
          return {
            success: true,
            response: validated,
            fallbackUsed: 'json-extraction',
          };
        }
      } catch (extractError) {
        // Strategy 3: Try to fix common JSON issues
        try {
          const fixed = this.fixCommonJSONIssues(rawResponse);
          const parsed = JSON.parse(fixed);
          const validated = LLMResponseSchema.parse(parsed);
          return {
            success: true,
            response: validated,
            fallbackUsed: 'json-fixing',
          };
        } catch (fixError) {
          // Strategy 4: Parse as text and extract verdict/reasoning
          try {
            const extracted = this.extractFromText(rawResponse);
            if (extracted) {
              return {
                success: true,
                response: extracted,
                fallbackUsed: 'text-extraction',
              };
            }
          } catch (textError) {
            // All strategies failed
            return {
              success: false,
              error: `Failed to parse response: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
          }
        }
      }
    }
    
    return {
      success: false,
      error: 'All parsing strategies failed',
    };
  }
  
  /**
   * Fix common JSON formatting issues
   */
  private static fixCommonJSONIssues(text: string): string {
    let fixed = text;
    
    // Remove markdown code blocks
    fixed = fixed.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Fix trailing commas
    fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
    
    // Fix single quotes to double quotes
    fixed = fixed.replace(/'/g, '"');
    
    // Fix unescaped quotes in strings
    fixed = fixed.replace(/"([^"]*)"([^"]*)"([^"]*)"/g, '"$1\\"$2\\"$3"');
    
    // Ensure proper object structure
    if (!fixed.includes('{')) {
      fixed = `{${fixed}}`;
    }
    
    return fixed;
  }
  
  /**
   * Extract verdict and reasoning from text response
   */
  private static extractFromText(text: string): LLMResponse | null {
    const lowerText = text.toLowerCase();
    
    // Extract verdict
    let verdict: 'pass' | 'fail' | 'inconclusive' | null = null;
    if (lowerText.includes('"pass"') || lowerText.includes('verdict: pass') || lowerText.includes('pass')) {
      verdict = 'pass';
    } else if (lowerText.includes('"fail"') || lowerText.includes('verdict: fail') || lowerText.includes('fail')) {
      verdict = 'fail';
    } else if (lowerText.includes('"inconclusive"') || lowerText.includes('verdict: inconclusive') || lowerText.includes('inconclusive')) {
      verdict = 'inconclusive';
    }
    
    if (!verdict) {
      return null;
    }
    
    // Extract reasoning
    let reasoning = text;
    
    // Try to find reasoning section
    const reasoningMatch = text.match(/reasoning[:\s]*([^\n]+)/i);
    if (reasoningMatch) {
      reasoning = reasoningMatch[1].trim();
    } else {
      // Use the whole text as reasoning, but clean it up
      reasoning = text.replace(/verdict[:\s]*\w+/gi, '').trim();
      if (reasoning.length > 500) {
        reasoning = reasoning.substring(0, 500) + '...';
      }
    }
    
    return {
      verdict,
      reasoning: reasoning || 'No reasoning provided',
    };
  }
}

// Fuzz testing utilities
export class LLMResponseFuzzer {
  /**
   * Generate malformed test cases
   */
  static generateMalformedResponses(): Array<{
    name: string;
    response: string;
    expectedToFail: boolean;
  }> {
    return [
      {
        name: 'Valid JSON',
        response: '{"verdict": "pass", "reasoning": "This is a valid response"}',
        expectedToFail: false,
      },
      {
        name: 'Missing verdict',
        response: '{"reasoning": "This response is missing the verdict"}',
        expectedToFail: true,
      },
      {
        name: 'Missing reasoning',
        response: '{"verdict": "pass"}',
        expectedToFail: true,
      },
      {
        name: 'Invalid verdict',
        response: '{"verdict": "maybe", "reasoning": "Invalid verdict value"}',
        expectedToFail: true,
      },
      {
        name: 'Empty reasoning',
        response: '{"verdict": "pass", "reasoning": ""}',
        expectedToFail: true,
      },
      {
        name: 'JSON with extra text',
        response: 'Here is my evaluation: {"verdict": "fail", "reasoning": "The answer is incorrect"}',
        expectedToFail: false,
      },
      {
        name: 'Markdown code block',
        response: '```json\n{"verdict": "inconclusive", "reasoning": "Need more information"}\n```',
        expectedToFail: false,
      },
      {
        name: 'Trailing comma',
        response: '{"verdict": "pass", "reasoning": "Good answer",}',
        expectedToFail: false,
      },
      {
        name: 'Single quotes',
        response: "{'verdict': 'fail', 'reasoning': 'Wrong answer'}",
        expectedToFail: false,
      },
      {
        name: 'Unescaped quotes',
        response: '{"verdict": "pass", "reasoning": "The answer is "correct" and well-reasoned"}',
        expectedToFail: false,
      },
      {
        name: 'Text format',
        response: 'Verdict: pass\nReasoning: This is a good answer that demonstrates understanding.',
        expectedToFail: false,
      },
      {
        name: 'Completely malformed',
        response: 'This is not a valid response at all',
        expectedToFail: true,
      },
      {
        name: 'Null values',
        response: '{"verdict": null, "reasoning": null}',
        expectedToFail: true,
      },
      {
        name: 'Array instead of object',
        response: '["pass", "Good answer"]',
        expectedToFail: true,
      },
      {
        name: 'Nested object',
        response: '{"result": {"verdict": "pass", "reasoning": "Good"}}',
        expectedToFail: true,
      },
    ];
  }
  
  /**
   * Run fuzz tests
   */
  static runFuzzTests(): {
    passed: number;
    failed: number;
    results: Array<{
      name: string;
      success: boolean;
      error?: string;
      fallbackUsed?: string;
    }>;
  } {
    const testCases = this.generateMalformedResponses();
    const results = testCases.map(testCase => {
      const result = LLMResponseParser.parseResponse(testCase.response);
      
      const success = testCase.expectedToFail ? !result.success : result.success;
      
      return {
        name: testCase.name,
        success,
        error: result.error,
        fallbackUsed: result.fallbackUsed,
      };
    });
    
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    return {
      passed,
      failed,
      results,
    };
  }
}

// Utility function for easy testing
export function testLLMResponseParsing(): void {
  console.log('🧪 Running LLM Response Parser Fuzz Tests...\n');
  
  const results = LLMResponseFuzzer.runFuzzTests();
  
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total: ${results.results.length}\n`);
  
  results.results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const fallback = result.fallbackUsed ? ` (${result.fallbackUsed})` : '';
    console.log(`${status} ${result.name}${fallback}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n🎯 Fuzz testing complete!');
}
