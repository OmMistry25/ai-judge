import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.0';
import { z } from 'https://esm.sh/zod@3.22.4';

// Request payload schema
const RunEvaluationsRequestSchema = z.object({
  queueId: z.string(),
});

type RunEvaluationsRequest = z.infer<typeof RunEvaluationsRequestSchema>;

// Response schema
const RunEvaluationsResponseSchema = z.object({
  success: z.boolean(),
  runId: z.string().optional(),
  summary: z.object({
    planned: z.number(),
    completed: z.number(),
    failed: z.number(),
  }).optional(),
  error: z.string().optional(),
});

type RunEvaluationsResponse = z.infer<typeof RunEvaluationsResponseSchema>;

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
    const validatedRequest = RunEvaluationsRequestSchema.parse(body);

    console.log('Run evaluations request:', validatedRequest);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create a new run record
    const runId = crypto.randomUUID();
    const { error: runError } = await supabase
      .from('runs')
      .insert({
        id: runId,
        queue_id: validatedRequest.queueId,
        planned_count: 0,
        completed_count: 0,
        failed_count: 0,
      });

    if (runError) {
      throw new Error(`Failed to create run: ${runError.message}`);
    }

    // For now, return empty summary (will be implemented in T30)
    const response: RunEvaluationsResponse = {
      success: true,
      runId,
      summary: {
        planned: 0,
        completed: 0,
        failed: 0,
      },
    };

    console.log('Run evaluations response:', response);

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
    console.error('Run evaluations function error:', error);

    const errorResponse: RunEvaluationsResponse = {
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
