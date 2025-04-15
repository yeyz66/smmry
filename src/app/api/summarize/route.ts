import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import OpenAI from "openai";
import { getServerSession } from "next-auth/next";
// Import the named export authOptions
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; 
import { createClient } from '@supabase/supabase-js';
// Correct path relative to @/ alias (smmry-app/src/)
import { summarizationLimits } from '@/../config/limits'; 
import { User as NextAuthUser } from 'next-auth'; // Import User type

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
  // Explicitly type session.user and safely access id
  const user = session.user as NextAuthUser & { id: string }; // Assuming id is string
  const userId = user.id;

  try {
    // 3. Fetch Current Count & Modify Time, Check Limit based on Date
    let currentCount = 0;
    let isNewDay = true; // Assume new day or new user initially

    // Get the start of today in UTC for consistent comparison
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const { data: userData, error: fetchError } = await supabase
      .from('user_summarization_counts')
      .select('count, modify_time') // Select both count and modify_time
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: Row not found
      console.error("Error fetching user data:", fetchError);
      throw new Error("Failed to fetch user summarization data.");
    }

    if (userData) {
      currentCount = userData.count;
      // Compare modify_time date with today's date
      const lastModifiedDate = new Date(userData.modify_time);
      lastModifiedDate.setUTCHours(0, 0, 0, 0); // Normalize to start of the day UTC

      if (lastModifiedDate.getTime() === todayStart.getTime()) {
        // It's the same day
        isNewDay = false;
      }
      // If lastModifiedDate < todayStart, isNewDay remains true (reset)
    }
    // If userData is null (PGRST116), isNewDay remains true (new user)

    // Check limit ONLY if it's the same day and count is already at/above limit
    if (!isNewDay && currentCount >= summarizationLimits.google) {
      return NextResponse.json(
        { error: "Daily summarization limit reached. Please try again tomorrow." }, 
        { status: 429 } // Too Many Requests
      );
    }
    
    // Determine the count to be set after successful summarization
    // If it's a new day, count resets to 1, otherwise increments
    const nextCount = isNewDay ? 1 : currentCount + 1;

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
    
    // 4. Call DeepSeek API (Proceed if limit not reached or if it's a new day)
    const summary = await summarizeWithDeepSeek(text, targetWordCount, style, complexity);
    
    // 5. Upsert Count and Modify Time in Supabase
    // Upsert handles both insert (if user_id doesn't exist) and update
    const { error: upsertError } = await supabase
      .from('user_summarization_counts')
      .upsert({ 
        user_id: userId, 
        count: nextCount, // Use the calculated next count
        modify_time: new Date().toISOString() // Update timestamp
      }, {
        onConflict: 'user_id' // Specify the conflict target (usually the primary key)
      });

    if (upsertError) {
        console.error("Error upserting user count:", upsertError);
        // Decide if you should still return the summary or an error
        // Returning 500 as the state might be inconsistent
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
    
  } catch (error: unknown) { // Change 'any' to 'unknown'
    // Log different types of errors
    // Check if error is an instance of Error before accessing message
    let errorMessage = "Failed to process request";
    if (error instanceof Error) {
        errorMessage = error.message;
        if (errorMessage.includes("Failed to fetch") || errorMessage.includes("Failed to summarize") || errorMessage.includes("Failed to update")) {
           // Specific internal errors already logged
           return NextResponse.json({ error: errorMessage }, { status: 500 });
        } else {
           // General processing error
           console.error("Error processing summarization request:", error);
           return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
        }
    } else {
        // Handle non-Error types if necessary
        console.error("An unexpected error occurred:", error);
        return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
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