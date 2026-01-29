import { GoogleGenAI } from "@google/genai";
import { StoryBible, StoryChapter } from "@/lib/types";
import { getPromptModifiers } from "@/lib/style-presets";

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
    const model = "gemini-3-flash-preview";

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

    // 获取风格修饰语（预设或自定义）
    const styleModifiers = getPromptModifiers(
      bible.instructions.stylePresetId,
      bible.instructions.customPromptModifiers
    );

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
      3. **CONTINUITY IS CRITICAL**:
         - IF this is not the first chapter, you MUST start exactly where the previous chapter ended (${previousLocation || "unknown"}).
         - Ensure consistency with previously acquired items and character knowledge.

      WRITING STYLE REQUIREMENTS (严格遵循用户设定):
      - 叙事视角: ${bible.instructions.pov || "第三人称有限视角"}
      - 节奏控制: ${bible.instructions.pacing || "根据情节自然调节"}
      - 对话风格: ${bible.instructions.dialogueStyle || "自然流畅"}
      - 感官细节: ${bible.instructions.sensoryDetails || "适度描写"}
      - 关键意象: ${bible.instructions.keyElements || "无特殊要求"}
      - 避免事项: ${bible.instructions.avoid || "无特殊禁忌"}
      - 整体基调: ${bible.core.styleTone || "根据题材自然呈现"}

      ${styleModifiers ? `${styleModifiers}` : ""}

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
