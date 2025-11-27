import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  StoryBible,
  StoryChapter,
  CoreConcept,
  Character,
  WritingInstructions,
} from "@/lib/types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Helper to parse JSON safely
const parseJSON = (text: string) => {
  try {
    const cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("JSON Parse Error", e);
    return null;
  }
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, payload } = body;
    const ai = getAI();

    switch (action) {
      case "generateFullStoryBible": {
        const { idea, targetChapterCount, targetChapterWordCount } = payload;
        const model = "gemini-3-pro-preview";
        const prompt = `
          Role: 顶级畅销小说架构师。
          Task: 根据用户的灵感，一次性构建完整的小说设定集 (Story Bible)。
          
          User Idea: "${idea}"
          Target Chapter Count: ${targetChapterCount}
          Target Word Count per Chapter: ${targetChapterWordCount}
          
          Strict Guidelines:
          1. Output MUST be a valid JSON object matching the StoryBible structure exactly.
          2. ALL string values MUST be in Simplified Chinese (简体中文).
          3. The 'title' field MUST NOT contain book title marks like 《》. Just the text.
          4. **PLOT ARCHITECTURE**: Create a high-stakes, fast-paced plot. Avoid filler episodes. Ensure each chapter outline has a clear conflict and ends with a hook or cliffhanger.
          5. **CHARACTER DEPTH**: Characters should be defined by their internal conflicts and active choices, not just passive traits.
          6. Chapter titles in the 'outline' MUST follow the format "第X章：Title".
          
          JSON Structure Requirement:
          {
            "core": {
              "title": "String (No book title marks like 《》)",
              "theme": "String",
              "logline": "String",
              "genre": "String",
              "settingTime": "String",
              "settingPlace": "String",
              "settingWorld": "String",
              "styleTone": "String",
              "targetChapterCount": ${targetChapterCount},
              "targetChapterWordCount": ${targetChapterWordCount}
            },
            "characters": [
              {
                "id": "use random string",
                "name": "String",
                "role": "Protagonist" | "Antagonist" | "Supporting",
                "description": "String",
                "background": "String",
                "motivation": "String",
                "arcOrConflict": "String"
              }
            ],
            "outline": [
              {
                "id": "use random string",
                "title": "String (Format: '第X章：Title')",
                "summary": "String (Focus on conflict and outcome)",
                "isGenerated": false
              }
            ],
            "instructions": {
              "pov": "String",
              "pacing": "快节奏，情节紧凑，拒绝注水",
              "dialogueStyle": "String",
              "sensoryDetails": "String",
              "keyElements": "String",
              "avoid": "避免过多的肢体动作描写（如频繁的点头、叹气、移动），避免流水账。"
            }
          }
        `;

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            thinkingConfig: { thinkingBudget: 4096 },
          },
        });

        const result = parseJSON(response.text || "{}");
        if (!result || !result.core)
          throw new Error("Invalid generation result");

        if (result.core.title)
          result.core.title = result.core.title.replace(/[《》]/g, "");

        // Post-processing arrays
        if (result.characters) {
          result.characters = result.characters.map((c: any, i: number) => ({
            ...c,
            id: randomUUID(),
            role: ["Protagonist", "Antagonist", "Supporting"].includes(c.role)
              ? c.role
              : "Supporting",
          }));
        } else {
          result.characters = [];
        }

        if (result.outline) {
          result.outline = result.outline.map((c: any, i: number) => ({
            ...c,
            id: randomUUID(),
            isGenerated: false,
          }));
        } else {
          result.outline = [];
        }

        if (!result.instructions) {
          result.instructions = {
            pov: "",
            pacing: "",
            dialogueStyle: "",
            sensoryDetails: "",
            keyElements: "",
            avoid: "",
          };
        }

        return NextResponse.json(result);
      }

      case "generateStoryCore": {
        const { current } = payload;
        const model = "gemini-3-pro-preview";
        const prompt = `
          Role: 世界级小说家和创意总监。
          Task: 为一部小说创建或优化核心设定 (Core Concept)。
          
          User Input (请以此为指导，补充缺失部分，或润色现有内容):
          ${JSON.stringify(current)}
          
          Strict Guidelines:
          1. Output MUST be valid JSON only.
          2. ALL string values MUST be in Simplified Chinese (简体中文).
          3. NO English comments or explanations inside or outside the JSON.
          
          Return a JSON object with these exact keys:
          - title: (string) 一个引人入胜、富有文学性的小说标题 (切记不要包含《》书名号)。
          - theme: (string) 核心主题。
          - logline: (string) 50字以内的精彩一句话梗概，必须包含强烈的冲突。
          - genre: (string) 具体类型。
          - settingTime: (string) 时间/时代背景。
          - settingPlace: (string) 地点/环境细节。
          - settingWorld: (string) 世界观规则或关键技术。
          - styleTone: (string) 叙事声音和氛围基调。
        `;

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });
        const result = parseJSON(response.text || "{}") || current;
        if (result.title) result.title = result.title.replace(/[《》]/g, "");
        return NextResponse.json(result);
      }

      case "generateCharacterList": {
        const { core, currentChars } = payload;
        const model = "gemini-3-pro-preview";
        const prompt = `
          Role: 角色设计师。
          Context: 基于以下小说核心设定:
          ${JSON.stringify(core)}

          Task: 创建一组角色（主角、反派、1-2个配角）。
          如果用户提供了下方角色，请润色它们。如果是空的，请创建新角色。
          
          User Input Characters:
          ${JSON.stringify(currentChars)}

          Strict Guidelines:
          1. Output MUST be valid JSON only.
          2. Content MUST be in Simplified Chinese (简体中文).
          3. Strictly use 'Protagonist', 'Antagonist', 'Supporting' for the 'role' value (Keep these English enum keys).
          4. NO extra English comments.

          Return a JSON ARRAY of objects with these keys:
          - id: (string) use a random string or keep existing.
          - name: (string) 姓名
          - role: (string) 'Protagonist' | 'Antagonist' | 'Supporting'
          - description: (string) 外貌与性格特征。
          - background: (string) 背景故事。
          - motivation: (string) 核心动机（必须具体且强烈）。
          - arcOrConflict: (string) 人物弧光或主要冲突（必须具有戏剧性）。
        `;

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });
        const chars = parseJSON(response.text || "[]");
        const finalChars = chars.map((c: any) => ({
          ...c,
          id: randomUUID(),
        }));
        return NextResponse.json(finalChars);
      }

      case "generateWritingInstructions": {
        const { bible } = payload;
        const model = "gemini-3-pro-preview";
        const prompt = `
          Role: 文学编辑。
          Context:
          Core: ${JSON.stringify(bible.core)}
          Characters: ${JSON.stringify(
            bible.characters.map((c: Character) => c.name + ": " + c.role)
          )}

          Task: 定义写作风格指南。
          
          Strict Guidelines:
          1. Output MUST be valid JSON only.
          2. ALL string values MUST be in Simplified Chinese (简体中文).
          3. NO English comments.
          
          Return a JSON object with these keys:
          - pov: (string) 叙事视角 (例如："第三人称有限视角")。
          - pacing: (string) 节奏控制要求 (emphasize fast-paced and tight plotting)。
          - dialogueStyle: (string) 对话风格特点。
          - sensoryDetails: (string) 感官描写重点。
          - keyElements: (string) 反复出现的意象或符号。
          - avoid: (string) 禁止事项 (Explicitly mention avoiding excessive physical movement descriptions like "nodding", "sighing", "walking").
        `;

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });
        return NextResponse.json(parseJSON(response.text || "{}"));
      }

      case "analyzeChapterContext": {
        const { content, title } = payload;
        const model = "gemini-2.5-flash";
        const prompt = `
          Role: Continuity Editor for a novel.
          Task: Analyze the following chapter content and extract key information to ensure continuity in future chapters.
          
          Chapter Title: ${title}
          Content:
          ${content}

          Strict Guidelines:
          1. Output MUST be valid JSON only.
          2. ALL string values MUST be in Simplified Chinese (简体中文), except for the JSON keys.
          3. NO English comments.
          
          Return a JSON object with these exact keys:
          - summary: (string) A concise 50-100 word summary of WHAT happened.
          - keyEvents: (string[]) List of 3-5 major plot points or revelations.
          - items: (string[]) Key items acquired, lost, or significantly used (e.g., "Found the rusty key", "Lost the map").
          - location: (string) EXACTLY where does the chapter end? Be specific about the immediate surroundings (e.g., "Standing in front of the old oak door in the basement").
          - characters: (string[]) List of characters who were active/present in this chapter.
        `;

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });
        return NextResponse.json(parseJSON(response.text || "{}"));
      }

      case "generateFullOutline": {
        const { bible } = payload;
        const model = "gemini-3-pro-preview";
        const targetCount = bible.core?.targetChapterCount || 8;

        const prompt = `
          Context: Create a structured chapter outline for a novel based on these settings.
          Settings: ${JSON.stringify(bible.core)}
          Characters: ${JSON.stringify(bible.characters)}

          Task: Generate a list of chapters (approximately ${targetCount} chapters) that form a complete and compelling story arc from beginning to end.
          
          Strict Guidelines:
          1. Output MUST be valid JSON only.
          2. ALL string values MUST be in Simplified Chinese (简体中文).
          3. NO English comments.
          4. The 'title' of each chapter MUST start with the format "第X章" (e.g., "第1章：The Beginning").
          5. **DRAMATIC STRUCTURE**: Ensure the plot has rising action, a climax, and significant turning points. Avoid repetitive scenarios.
          
          Return a JSON array of objects with this shape:
          { "title": string (Format: '第X章：Title'), "summary": string (Chinese, focusing on key plot events and conflicts) }
          
          Return ONLY the JSON array.
        `;
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });
        const text = response.text || "[]";
        return NextResponse.json(parseJSON(text) || []);
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
