import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import OpenAI from "openai";
import { getServerSession } from "next-auth/next";
// Import the named export authOptions
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; 
import { createClient } from '@supabase/supabase-js';
// Correct path relative to @/ alias (smmry-app/src/)
import { summarizationLimits } from '@/../config/limits'; 

// Validation schema for the request body
const summarizeRequestSchema = z.object({
  text: z.string().min(10, "Text must be at least 10 characters long"),
  length: z.enum(["very-short", "short", "medium", "long"]).default("short"),
  style: z.enum(["concise", "detailed", "bullet-points", "academic", "simplified"]).default("concise"),
  complexity: z.number().min(1).max(5).default(3),
});

// Type inference from the schema
type SummarizeRequest = z.infer<typeof summarizeRequestSchema>;

// Configure DeepSeek API client
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || '' // Add this to your .env.local file
});

// Initialize Supabase client - Ensure these env vars are set!
// Use Service Role Key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Supabase URL or Service Role Key is missing in environment variables.");
  // Potentially throw an error or handle this case appropriately
  // For now, logging an error. Requests will fail later if client isn't initialized.
}

// Create a single supabase client instance per request potentially, or reuse if safe
// Note: For serverless functions, creating per request is common.
const supabase = supabaseUrl && supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        // Important for server-side operations, prevents using user's JWT
        persistSession: false,
        autoRefreshToken: false, 
      }
    })
  : null;

export async function POST(request: NextRequest) {
  // Check for Supabase client initialization
  if (!supabase) {
      console.error("Supabase client not initialized. Check environment variables.");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }
    
  // 1. Get User Session
  const session = await getServerSession(authOptions);

  // 2. Check for Login (Require Login)
  if (!session) {
    return NextResponse.json(
      { error: "Please log in with Google using the top-right button to continue." },
      { status: 401 },
    );
  }
  const userId = (session.user as any).id; // Extract user ID

  try {
    // 3. Fetch Current Count & Check Limit
    let currentCount = 0;
    let userRecordExists = false;

    const { data: countData, error: countError } = await supabase
      .from('user_summarization_counts')
      .select('count')
      .eq('user_id', userId)
      .single(); // Use single() as user_id is primary key

    if (countError && countError.code !== 'PGRST116') { // PGRST116: Row not found, which is fine
      console.error("Error fetching user count:", countError);
      throw new Error("Failed to fetch user summarization count.");
    }

    if (countData) {
      currentCount = countData.count;
      userRecordExists = true;
    }
    
    // Check against the Google limit since login is required
    if (currentCount >= summarizationLimits.google) {
      return NextResponse.json({ error: "Summarization limit reached" }, { status: 429 });
    }

    // Parse and validate the request body (moved after auth/limit check)
    const body = await request.json();
    const result = summarizeRequestSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { text, length, style, complexity } = result.data;
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    let percentToKeep;
    switch (length) {
      case "very-short": percentToKeep = 0.1; break;
      case "short": percentToKeep = 0.25; break;
      case "medium": percentToKeep = 0.5; break;
      case "long": percentToKeep = 0.75; break;
      default: percentToKeep = 0.25;
    }
    const targetWordCount = Math.max(Math.floor(wordCount * percentToKeep), 10);
    
    // 4. Call DeepSeek API (Proceed if limit not reached)
    const summary = await summarizeWithDeepSeek(text, targetWordCount, style, complexity);
    
    // 5. Increment Count in Supabase
    let updateError = null;
    if (userRecordExists) {
        const { error } = await supabase
            .from('user_summarization_counts')
            .update({ count: currentCount + 1 })
            .eq('user_id', userId);
        updateError = error;
    } else {
        // First summary for this user
        const { error } = await supabase
            .from('user_summarization_counts')
            .insert({ user_id: userId, count: 1 });
         updateError = error;
    }

    if (updateError) {
        console.error("Error updating user count:", updateError);
        // Decide if you should still return the summary or an error
        // Returning 500 for now as the state is inconsistent
        return NextResponse.json({ error: "Failed to update usage count" }, { status: 500 });
    }

    // Return the summary
    const summaryWordCount = summary.split(/\s+/).filter(Boolean).length;
    return NextResponse.json({
      summary,
      metadata: {
        originalWordCount: wordCount,
        summaryWordCount,
        percentReduced: Math.round((1 - (summaryWordCount / wordCount)) * 100),
        length,
        style,
        complexity
      }
    });
    
  } catch (error: any) {
    // Log different types of errors
    if (error.message.includes("Failed to fetch") || error.message.includes("Failed to summarize") || error.message.includes("Failed to update")) {
       // Specific internal errors already logged
       return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
       // General processing error
       console.error("Error processing summarization request:", error);
       return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
  }
}

// Function to summarize text using DeepSeek API
async function summarizeWithDeepSeek(
  text: string, 
  targetWordCount: number,
  style: string,
  complexity: number
): Promise<string> {
  try {
    // Create the prompt for DeepSeek based on the options
    let prompt = `Summarize the following text in about ${targetWordCount} words.`;
    
    // Add style instructions
    switch(style) {
      case "concise":
        prompt += " Make it clear and to the point.";
        break;
      case "detailed":
        prompt += " Include important details and nuances.";
        break;
      case "bullet-points":
        prompt += " Format the summary as bullet points.";
        break;
      case "academic":
        prompt += " Use an academic tone and formal language.";
        break;
      case "simplified":
        prompt += " Use simple language that's easy to understand.";
        break;
    }
    
    // Add complexity guidance
    if (complexity <= 2) {
      prompt += " Use simple vocabulary and straightforward sentence structure.";
    } else if (complexity >= 4) {
      prompt += " You may use sophisticated vocabulary and complex sentence structures where appropriate.";
    }
    
    // Call the DeepSeek API
    const completion = await openai.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are an expert summarizer. Your job is to extract the most important information from texts while maintaining accuracy and context." 
        },
        { 
          role: "user", 
          content: `${prompt}\n\nHere's the text to summarize:\n\n${text}` 
        }
      ],
      model: "deepseek-chat",
    });
    
    let summaryContent = completion.choices[0].message.content || "Error: No summary was generated.";
    
    // Remove leading and trailing double quotes if they exist
    if (summaryContent.startsWith('"') && summaryContent.endsWith('"')) {
      summaryContent = summaryContent.slice(1, -1);
    }
    
    return summaryContent;
  } catch (error) {
    console.error("Error calling DeepSeek API:", error);
    throw new Error("Failed to summarize text with DeepSeek API");
  }
} 