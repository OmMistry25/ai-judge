import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.0';
import { z } from 'https://esm.sh/zod@3.22.4';

// Import our new prompt building functions
// Note: In a real deployment, these would be imported from the shared package
// For now, we'll inline the functions to avoid import issues in Deno

function buildSystemPrompt(judge: any): string {
  let systemPrompt = judge.system_prompt;
  
  if (!systemPrompt.toLowerCase().includes('evaluate') && 
      !systemPrompt.toLowerCase().includes('verdict') &&
      !systemPrompt.toLowerCase().includes('pass') &&
      !systemPrompt.toLowerCase().includes('fail')) {
    
    systemPrompt += `

You are an AI judge that evaluates answers to questions. Your task is to:
1. Carefully read the question and the provided answer
2. Evaluate the answer based on the criteria above
3. Provide a verdict: "pass", "fail", or "inconclusive"
4. Give detailed reasoning for your decision

Respond with a JSON object containing:
- "verdict": either "pass", "fail", or "inconclusive"
- "reasoning": a detailed explanation of your evaluation

Be objective, fair, and thorough in your evaluation.`;
  }
  
  return systemPrompt;
}

function buildUserPrompt(context: any): string {
  const { question, answer } = context;
  
  let answerText = '';
  if (answer.choice && answer.reasoning) {
    answerText = `Choice: ${answer.choice}\nReasoning: ${answer.reasoning}`;
  } else if (answer.choice) {
    answerText = `Choice: ${answer.choice}`;
  } else if (answer.reasoning) {
    answerText = `Reasoning: ${answer.reasoning}`;
  } else {
    answerText = 'No answer provided';
  }
  
  return `Question: ${question.question_text}

Answer to evaluate:
${answerText}

Please evaluate this answer and respond with a JSON object containing:
- "verdict": either "pass", "fail", or "inconclusive"
- "reasoning": a detailed explanation of your evaluation

Respond only with valid JSON, no additional text.`;
}

// Enhanced LLM response parser (simplified version for Edge Function)
function parseLLMResponse(rawResponse: string): {
  success: boolean;
  response?: { verdict: string; reasoning: string };
  error?: string;
  fallbackUsed?: string;
} {
  // Strategy 1: Direct JSON parsing
  try {
    const parsed = JSON.parse(rawResponse);
    if (parsed.verdict && parsed.reasoning) {
      return { success: true, response: parsed };
    }
  } catch (error) {
    // Strategy 2: Extract JSON from response
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extracted = JSON.parse(jsonMatch[0]);
        if (extracted.verdict && extracted.reasoning) {
          return { success: true, response: extracted, fallbackUsed: 'json-extraction' };
        }
      }
    } catch (extractError) {
      // Strategy 3: Try to fix common JSON issues
      try {
        let fixed = rawResponse
          .replace(/```json\s*/g, '')
          .replace(/```\s*/g, '')
          .replace(/,(\s*[}\]])/g, '$1')
          .replace(/'/g, '"');
        
        const parsed = JSON.parse(fixed);
        if (parsed.verdict && parsed.reasoning) {
          return { success: true, response: parsed, fallbackUsed: 'json-fixing' };
        }
      } catch (fixError) {
        // Strategy 4: Parse as text
        const lowerText = rawResponse.toLowerCase();
        let verdict: string | null = null;
        
        if (lowerText.includes('"pass"') || lowerText.includes('verdict: pass')) {
          verdict = 'pass';
        } else if (lowerText.includes('"fail"') || lowerText.includes('verdict: fail')) {
          verdict = 'fail';
        } else if (lowerText.includes('"inconclusive"') || lowerText.includes('verdict: inconclusive')) {
          verdict = 'inconclusive';
        }
        
        if (verdict) {
          const reasoning = rawResponse.replace(/verdict[:\s]*\w+/gi, '').trim() || 'No reasoning provided';
          return { 
            success: true, 
            response: { verdict, reasoning }, 
            fallbackUsed: 'text-extraction' 
          };
        }
      }
    }
  }
  
  return { success: false, error: 'All parsing strategies failed' };
}

// Request payload schema
const EvaluateRequestSchema = z.object({
  submissionId: z.string(),
  templateId: z.string(),
  judgeId: z.string(),
});

type EvaluateRequest = z.infer<typeof EvaluateRequestSchema>;

// Response schema
const EvaluateResponseSchema = z.object({
  success: z.boolean(),
  evaluation: z.object({
    id: z.string(),
    submissionId: z.string(),
    templateId: z.string(),
    judgeId: z.string(),
    verdict: z.enum(['pass', 'fail', 'inconclusive']),
    reasoning: z.string(),
    provider: z.string(),
    model: z.string(),
    latencyMs: z.number().optional(),
    error: z.string().optional(),
  }).optional(),
  error: z.string().optional(),
});

type EvaluateResponse = z.infer<typeof EvaluateResponseSchema>;

// Timeout wrapper for API calls
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operation: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Timeout: ${operation} exceeded ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

// Retry wrapper for JSON parsing
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number,
  operationName: string
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 ${operationName} - Attempt ${attempt}/${maxRetries}`);
      const result = await operation();
      if (attempt > 1) {
        console.log(`✅ ${operationName} succeeded on attempt ${attempt}`);
      }
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.log(`❌ ${operationName} failed on attempt ${attempt}: ${lastError.message}`);
      
      if (attempt === maxRetries) {
        console.log(`💥 ${operationName} failed after ${maxRetries} attempts`);
        throw lastError;
      }
      
      // Wait before retry (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error(`${operationName} failed after ${maxRetries} attempts`);
}

// Real OpenAI evaluation function
async function evaluateWithOpenAI(
  submissionId: string,
  templateId: string,
  judgeId: string,
  supabase: any
): Promise<EvaluateResponse['evaluation']> {
  const startTime = Date.now();
  
  try {
    // Get the judge details
    const { data: judge, error: judgeError } = await supabase
      .from('judges')
      .select('*')
      .eq('id', judgeId)
      .single();

    if (judgeError || !judge) {
      throw new Error(`Judge not found: ${judgeError?.message || 'Unknown error'}`);
    }

    // Get the question details
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('*')
      .eq('submission_id', submissionId)
      .eq('template_id', templateId)
      .single();

    if (questionError || !question) {
      throw new Error(`Question not found: ${questionError?.message || 'Unknown error'}`);
    }

    // Get the answer details
    const { data: answer, error: answerError } = await supabase
      .from('answers')
      .select('*')
      .eq('submission_id', submissionId)
      .eq('template_id', templateId)
      .single();

    if (answerError || !answer) {
      throw new Error(`Answer not found: ${answerError?.message || 'Unknown error'}`);
    }

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY environment variable not set');
    }
    
    console.log('🔑 OpenAI API key found:', openaiApiKey.substring(0, 10) + '...');

    // Build the prompt using our new prompt system
    const context = {
      judge,
      question,
      answer,
      submissionId
    };
    
    const systemPrompt = buildSystemPrompt(judge);
    const userPrompt = buildUserPrompt(context);

    console.log('📝 Judge Details:');
    console.log('  - Name:', judge.name);
    console.log('  - Provider:', judge.provider);
    console.log('  - Model:', judge.model);
    console.log('  - System Prompt:', systemPrompt);
    
    console.log('📋 Question Details:');
    console.log('  - Question Text:', question.question_text);
    console.log('  - Question Type:', question.question_type);
    
    console.log('💬 Answer Details:');
    console.log('  - Choice:', answer.choice);
    console.log('  - Reasoning:', answer.reasoning);
    
        console.log('🤖 Sending to OpenAI API...');
        console.log('  - Model:', judge.model || 'gpt-4');
        console.log('  - System Prompt Length:', systemPrompt.length);
        console.log('  - User Prompt Length:', userPrompt.length);
        console.log('  - Timeout: 20 seconds');
        console.log('  - Retry: Max 1 retry for JSON parsing');

        // Call OpenAI API with timeout (20 seconds)
        const openaiResponse = await withTimeout(
          fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: judge.model || 'gpt-4',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ],
              temperature: 0.1,
              max_tokens: 1000,
            }),
          }),
          20000, // 20 second timeout
          'OpenAI API call'
        );

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.log('❌ OpenAI API Error:', openaiResponse.status, errorText);
      throw new Error(`OpenAI API error: ${openaiResponse.status} ${errorText}`);
    }

    const openaiResult = await openaiResponse.json();
    const aiResponse = openaiResult.choices[0]?.message?.content;

    console.log('✅ OpenAI API Response received!');
    console.log('  - Status:', openaiResponse.status);
    console.log('  - Raw AI Response:', aiResponse);
    console.log('  - Usage:', openaiResult.usage);

    if (!aiResponse) {
      console.log('❌ No content in OpenAI response');
      throw new Error('No response from OpenAI');
    }

      // Parse the AI response using retry logic (max 1 retry)
      const parsedResponse = await withRetry(
        async () => {
          const parseResult = parseLLMResponse(aiResponse);
          if (!parseResult.success) {
            throw new Error(`Parse failed: ${parseResult.error}`);
          }
          return parseResult.response;
        },
        2, // max 1 retry (2 total attempts)
        'JSON parsing'
      );
      
      console.log('✅ Successfully parsed AI response');

    console.log('📊 Parsed AI Response:');
    console.log('  - Verdict:', parsedResponse.verdict);
    console.log('  - Reasoning:', parsedResponse.reasoning);

    // Validate the response structure
    if (!parsedResponse.verdict || !parsedResponse.reasoning) {
      console.log('❌ Invalid AI response structure');
      throw new Error(`Invalid AI response structure: ${JSON.stringify(parsedResponse)}`);
    }

    if (!['pass', 'fail', 'inconclusive'].includes(parsedResponse.verdict)) {
      console.log('❌ Invalid verdict:', parsedResponse.verdict);
      throw new Error(`Invalid verdict: ${parsedResponse.verdict}`);
    }

    const latencyMs = Date.now() - startTime;

    console.log('🎉 Evaluation completed successfully!');
    console.log('  - Final Verdict:', parsedResponse.verdict);
    console.log('  - Processing Time:', latencyMs + 'ms');
    console.log('  - Judge Used:', judge.name);

    return {
      id: crypto.randomUUID(),
      submissionId,
      templateId,
      judgeId,
      verdict: parsedResponse.verdict,
      reasoning: parsedResponse.reasoning,
      provider: judge.provider,
      model: judge.model,
      latencyMs,
    };

      } catch (error) {
        const latencyMs = Date.now() - startTime;
        console.error('❌ OpenAI evaluation error:', error);
        console.log('  - Error Type:', typeof error);
        console.log('  - Error Message:', error instanceof Error ? error.message : 'Unknown error');
        console.log('  - Processing Time:', latencyMs + 'ms');
        
        // Determine if it's a timeout error
        const isTimeout = error instanceof Error && error.message.includes('Timeout');
        const errorMessage = isTimeout 
          ? 'Evaluation timed out after 20 seconds'
          : `Evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        
        return {
          id: crypto.randomUUID(),
          submissionId,
          templateId,
          judgeId,
          verdict: 'inconclusive',
          reasoning: errorMessage,
          provider: 'openai',
          model: 'gpt-4',
          latencyMs,
          error: errorMessage,
        };
      }
}

serve(async (req) => {
  try {
    // Handle CORS
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
      });
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { 
          status: 405,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedRequest = EvaluateRequestSchema.parse(body);

    console.log('🚀 Starting evaluation request:', validatedRequest);
    console.log('  - Submission ID:', validatedRequest.submissionId);
    console.log('  - Template ID:', validatedRequest.templateId);
    console.log('  - Judge ID:', validatedRequest.judgeId);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Run real OpenAI evaluation
    const evaluation = await evaluateWithOpenAI(
      validatedRequest.submissionId,
      validatedRequest.templateId,
      validatedRequest.judgeId,
      supabase
    );

    const response: EvaluateResponse = {
      success: true,
      evaluation,
    };

    console.log('✅ Evaluation completed and response ready:');
    console.log('  - Success:', response.success);
    console.log('  - Verdict:', evaluation?.verdict);
    console.log('  - Reasoning Length:', evaluation?.reasoning?.length);
    console.log('  - Latency:', evaluation?.latencyMs + 'ms');

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );

  } catch (error) {
    console.error('Evaluate function error:', error);

    const errorResponse: EvaluateResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
