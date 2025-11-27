import { GoogleGenAI } from "@google/genai";
import { StoryBible, StoryChapter } from "@/lib/types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bible, chapterId, previousChapters, rewriteInstructions } =
      body as {
        bible: StoryBible;
        chapterId: string;
        previousChapters: StoryChapter[];
        rewriteInstructions?: string;
      };

    const ai = getAI();
    const model = "gemini-3-pro-preview";

    const targetChapter = bible.outline.find((c) => c.id === chapterId);
    if (!targetChapter)
      return new Response("Chapter outline not found", { status: 404 });

    const wordCountTarget = bible.core.targetChapterWordCount || 1500;

    // Build context string (Moved from original service)
    let contextString = "";
    let previousLocation = "";
    let previousItems = "";

    if (previousChapters.length > 0) {
      contextString += "## PREVIOUS STORY SYNOPSIS (The story so far):\n";
      previousChapters.forEach((chap, index) => {
        const meta = chap.metadata;
        contextString += `\n[Chapter ${index + 1}: ${chap.title}]\n`;
        if (meta) {
          contextString += `Summary: ${meta.summary}\n`;
          contextString += `Key Events: ${meta.keyEvents.join(", ")}\n`;
          contextString += `Items Involved: ${meta.items.join(", ")}\n`;
          contextString += `Ending Location: ${meta.location}\n`;
        } else {
          contextString += `Content Excerpt: ${chap.content.substring(
            0,
            300
          )}...\n`;
        }
      });

      const lastChap = previousChapters[previousChapters.length - 1];
      if (lastChap.metadata) {
        previousLocation = lastChap.metadata.location;
        previousItems = lastChap.metadata.items.join(", ") || "None";
        contextString += `\n## CURRENT WORLD STATE (MUST FOLLOW FOR CONTINUITY):\n`;
        contextString += `- **STARTING LOCATION**: The scene MUST start at: ${previousLocation}\n`;
        contextString += `- **INVENTORY/STATUS**: Characters currently have: ${previousItems}\n`;
        contextString += `- **IMMEDIATE CONTEXT**: Continue directly from the events of the previous chapter.\n`;
      }
    } else {
      contextString =
        "This is the FIRST chapter. Establish the world and characters effectively. Start the plot immediately.";
    }

    let instructionBlock = "";
    if (rewriteInstructions && rewriteInstructions.trim()) {
      instructionBlock = `
      \n## REWRITE INSTRUCTIONS (USER FEEDBACK):
      The user has explicitly requested a rewrite with the following instructions:
      "${rewriteInstructions}"
      
      Please prioritizing incorporating these changes while maintaining story continuity and high literary quality.
      `;
    }

    const prompt = `
      You are "Fantasia" (幻境作家), a world-class novelist AI specialized in Chinese creative writing.
      STORY BIBLE (设定集):
      ${JSON.stringify(bible, null, 2)}
      ${contextString}
      CURRENT TASK:
      Write the content for chapter: "${targetChapter.title}".
      Plot Summary for this chapter: ${targetChapter.summary}
      ${instructionBlock}
      STRICT GUIDELINES:
      1. Language: Chinese (Simplified).
      2. Word count target: ${wordCountTarget} words (Chinese characters).
      3. Style: Follow the "Writing Instructions" in the Bible strictly.
      4. **CONTINUITY IS CRITICAL**: 
         - IF this is not the first chapter, you MUST start exactly where the previous chapter ended (${
           previousLocation || "unknown"
         }).
         - Ensure consistency with previously acquired items and character knowledge.
      CRITICAL STYLE ADJUSTMENTS (Addressing feedback):
      1. **TIGHT PACING (节奏紧凑)**: Avoid dragging scenes. Cut unnecessary transitions. Every paragraph must advance the plot or deepen the conflict.
      2. **REDUCE STAGE DIRECTIONS (减少琐碎动作)**: DO NOT over-describe physical movements (e.g., "he nodded," "she took a sip," "he shifted his weight," "he walked to the door"). Focus on the *subtext*, *dialogue*, and *psychological impact* instead of the mechanics of moving bodies.
      3. **SHOW, DON'T JUST DESCRIBE**: Instead of describing a character looking angry, show them taking a drastic action.
      4. **HIGH STAKES**: Ensure the chapter ends with tension or a revelation.
      Output ONLY the story content in Markdown format. Do not wrap in code blocks.
      Do not include the chapter title at the top, just the prose.
    `;

    const response = await ai.models.generateContentStream({
      model,
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 2048 } },
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream);
  } catch (error) {
    console.error("Stream API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
