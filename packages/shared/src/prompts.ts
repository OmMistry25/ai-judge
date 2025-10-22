import { z } from 'zod';

// Database types (snake_case from database)
export interface DatabaseJudge {
  id: string;
  name: string;
  system_prompt: string;
  provider: string;
  model: string;
  active: boolean;
}

export interface DatabaseQuestion {
  id: string;
  submission_id: string;
  template_id: string;
  rev: number;
  question_type: string;
  question_text: string;
}

export interface DatabaseAnswer {
  id: string;
  submission_id: string;
  template_id: string;
  choice: string | null;
  reasoning: string | null;
}

export interface EvaluationContext {
  judge: DatabaseJudge;
  question: DatabaseQuestion;
  answer: DatabaseAnswer;
  submissionId: string;
}

// Prompt building functions
export function buildSystemPrompt(judge: DatabaseJudge): string {
  // Use the judge's system prompt as the base
  let systemPrompt = judge.system_prompt;
  
  // Add evaluation instructions if not already present
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

export function buildUserPrompt(context: EvaluationContext): string {
  const { question, answer } = context;
  
  // Build the answer text
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
  
  // Build the user prompt based on question type
  let userPrompt = '';
  
  switch (question.question_type) {
    case 'single_choice_with_reasoning':
      userPrompt = `Question: ${question.question_text}

Answer to evaluate:
${answerText}

Please evaluate this answer and respond with a JSON object containing:
- "verdict": either "pass", "fail", or "inconclusive"
- "reasoning": a detailed explanation of your evaluation

Respond only with valid JSON, no additional text.`;
      break;
      
    case 'multi_choice':
      userPrompt = `Question: ${question.question_text}

Answer to evaluate:
${answerText}

Please evaluate this multiple choice answer and respond with a JSON object containing:
- "verdict": either "pass", "fail", or "inconclusive"
- "reasoning": a detailed explanation of your evaluation

Respond only with valid JSON, no additional text.`;
      break;
      
    case 'freeform':
      userPrompt = `Question: ${question.question_text}

Answer to evaluate:
${answerText}

Please evaluate this freeform answer and respond with a JSON object containing:
- "verdict": either "pass", "fail", or "inconclusive"
- "reasoning": a detailed explanation of your evaluation

Respond only with valid JSON, no additional text.`;
      break;
      
    default:
      userPrompt = `Question: ${question.question_text}

Answer to evaluate:
${answerText}

Please evaluate this answer and respond with a JSON object containing:
- "verdict": either "pass", "fail", or "inconclusive"
- "reasoning": a detailed explanation of your evaluation

Respond only with valid JSON, no additional text.`;
  }
  
  return userPrompt;
}

export function buildEvaluationPrompt(context: EvaluationContext): {
  systemPrompt: string;
  userPrompt: string;
} {
  return {
    systemPrompt: buildSystemPrompt(context.judge),
    userPrompt: buildUserPrompt(context),
  };
}

// Prompt validation
export const PromptValidationSchema = z.object({
  systemPrompt: z.string().min(10, 'System prompt must be at least 10 characters'),
  userPrompt: z.string().min(20, 'User prompt must be at least 20 characters'),
});

export type PromptValidation = z.infer<typeof PromptValidationSchema>;

export function validatePrompts(prompts: { systemPrompt: string; userPrompt: string }): {
  isValid: boolean;
  errors: string[];
} {
  try {
    PromptValidationSchema.parse(prompts);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return {
      isValid: false,
      errors: ['Unknown validation error'],
    };
  }
}

// Prompt utilities
export function estimateTokenCount(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters for English text
  // This is a simplified estimation, actual tokenization varies by model
  return Math.ceil(text.length / 4);
}

export function truncatePrompt(text: string, maxTokens: number): string {
  const estimatedTokens = estimateTokenCount(text);
  if (estimatedTokens <= maxTokens) {
    return text;
  }
  
  // Truncate to approximately maxTokens
  const maxChars = maxTokens * 4;
  return text.substring(0, maxChars) + '...';
}

export function getPromptStats(context: EvaluationContext): {
  systemPromptLength: number;
  userPromptLength: number;
  totalLength: number;
  estimatedTokens: number;
} {
  const prompts = buildEvaluationPrompt(context);
  const totalLength = prompts.systemPrompt.length + prompts.userPrompt.length;
  const estimatedTokens = estimateTokenCount(prompts.systemPrompt) + estimateTokenCount(prompts.userPrompt);
  
  return {
    systemPromptLength: prompts.systemPrompt.length,
    userPromptLength: prompts.userPrompt.length,
    totalLength,
    estimatedTokens,
  };
}
