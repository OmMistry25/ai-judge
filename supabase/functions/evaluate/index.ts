import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.0';
import { z } from 'https://esm.sh/zod@3.22.4';

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

// Mock evaluation function (will be replaced with real LLM call in T27)
function mockEvaluate(
  submissionId: string,
  templateId: string,
  judgeId: string
): EvaluateResponse['evaluation'] {
  // Simulate some processing time
  const latencyMs = Math.floor(Math.random() * 2000) + 500; // 500-2500ms
  
  // Mock verdicts with some randomness
  const verdicts = ['pass', 'fail', 'inconclusive'] as const;
  const verdict = verdicts[Math.floor(Math.random() * verdicts.length)];
  
  const reasoning = `Mock evaluation for submission ${submissionId}, question ${templateId}, judge ${judgeId}. This is a placeholder response.`;
  
  return {
    id: crypto.randomUUID(),
    submissionId,
    templateId,
    judgeId,
    verdict,
    reasoning,
    provider: 'openai',
    model: 'gpt-4',
    latencyMs,
  };
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

    console.log('Evaluate request:', validatedRequest);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // For now, return mock evaluation
    const mockEvaluation = mockEvaluate(
      validatedRequest.submissionId,
      validatedRequest.templateId,
      validatedRequest.judgeId
    );

    const response: EvaluateResponse = {
      success: true,
      evaluation: mockEvaluation,
    };

    console.log('Evaluate response:', response);

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
