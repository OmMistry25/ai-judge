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

    // Build the prompt
    const systemPrompt = judge.system_prompt;
    const userPrompt = `Question: ${question.question_text}

Answer to evaluate: ${answer.choice || answer.reasoning || 'No answer provided'}

Please evaluate this answer and respond with a JSON object containing:
- "verdict": either "pass", "fail", or "inconclusive"
- "reasoning": a detailed explanation of your evaluation

Respond only with valid JSON, no additional text.`;

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

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
    });

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

    // Parse the AI response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
      console.log('✅ Successfully parsed AI response as JSON');
    } catch (parseError) {
      console.log('⚠️ Failed to parse as JSON, trying to extract JSON...');
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
        console.log('✅ Successfully extracted and parsed JSON from response');
      } else {
        console.log('❌ Could not extract JSON from response');
        throw new Error(`Failed to parse AI response as JSON: ${aiResponse}`);
      }
    }

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
    
    return {
      id: crypto.randomUUID(),
      submissionId,
      templateId,
      judgeId,
      verdict: 'inconclusive',
      reasoning: `Evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      provider: 'openai',
      model: 'gpt-4',
      latencyMs,
      error: error instanceof Error ? error.message : 'Unknown error',
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
