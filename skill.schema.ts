// ============================================================
// Skill System — 类型定义、文件加载、匹配路由
// 位置: repo/skills/skill.schema.ts
// 用途: 被 DeepSeek TUI (.deepseek/instructions.md) 和
//       chatbot-note-master (server/src/llm/) 共同引用
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ── Skill 元数据结构 ──────────────────────────────────────

export interface SkillDefinition {
  /** skill 唯一标识（目录名） */
  id: string;
  /** 展示名称 */
  name: string;
  /** 简短描述（用于 LLM 匹配或用户选择） */
  description: string;
  /** 触发关键词 — 当用户输入包含这些词时自动匹配 */
  triggers: string[];
  /** system prompt 主体（从 prompt.md 读取） */
  systemPrompt: string;
  /** 配套文件（文件名 → 内容），由 skill.yaml 的 companion_files 声明 */
  companions: Record<string, string>;
}

// ── skill.yaml 解析中间格式 ────────────────────────────────

interface SkillYaml {
  name: string;
  description: string;
  triggers: string[];
  companion_files: string[];
}

// ── 加载器 ─────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * 从 skills 目录加载所有已注册 skill。
 * 每个子目录必须包含 skill.yaml + prompt.md。
 * 可选：companion_files 列表指定配套文件，会被自动读取并挂载到 companions 字段。
 */
export function loadSkills(skillsDir?: string): SkillDefinition[] {
  const dir = skillsDir ?? __dirname;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  const skills: SkillDefinition[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const skillDir = path.join(dir, entry.name);
    const yamlPath = path.join(skillDir, 'skill.yaml');
    const promptPath = path.join(skillDir, 'prompt.md');

    if (!fs.existsSync(yamlPath) || !fs.existsSync(promptPath)) continue;

    // 解析 yaml
    const yamlRaw = fs.readFileSync(yamlPath, 'utf-8');
    const meta = parseSimpleYaml<SkillYaml>(yamlRaw);
    const systemPrompt = fs.readFileSync(promptPath, 'utf-8').trim();

    // 读取配套文件
    const companions: Record<string, string> = {};
    const companionFiles = meta.companion_files ?? [];
    for (const fileName of companionFiles) {
      const filePath = path.join(skillDir, fileName);
      if (fs.existsSync(filePath)) {
        companions[fileName] = fs.readFileSync(filePath, 'utf-8').trim();
      }
    }

    skills.push({
      id: entry.name,
      name: meta.name,
      description: meta.description,
      triggers: meta.triggers ?? [],
      systemPrompt,
      companions,
    });
  }

  return skills;
}

/**
 * 根据用户输入匹配最佳 skill。
 * 返回匹配度降序列表（最高匹配优先）。
 */
export function matchSkills(
  input: string,
  skills: SkillDefinition[],
  topK = 1,
): SkillDefinition[] {
  const lower = input.toLowerCase();

  const scored = skills
    .map((s) => {
      const matchCount = s.triggers.filter((t) => lower.includes(t)).length;
      return { skill: s, score: matchCount };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, topK).map(({ skill }) => skill);
}

/**
 * 构建最终 system prompt：basePrompt 之上叠加匹配的 skill。
 * skill 的 prompt.md 在首，companion_files 内容依次跟在后面。
 */
export function buildSystemPrompt(
  input: string,
  skills: SkillDefinition[],
  basePrompt: string,
  context?: string,
): string {
  const matched = matchSkills(input, skills, 2);

  if (matched.length === 0) {
    return basePrompt.replace('{context}', context ?? '');
  }

  const skillBlocks = matched.map((s) => {
    let content = `[Skill: ${s.name} — ${s.description}]\n${s.systemPrompt}`;

    // 追加配套文件
    const companionNames = Object.keys(s.companions);
    if (companionNames.length > 0) {
      for (const name of companionNames) {
        content += `\n\n---\n[Companion: ${name}]\n${s.companions[name]}`;
      }
    }

    return content;
  });

  const combined = skillBlocks.join('\n\n---\n\n');
  const enhanced = `[激活 Skill]\n${combined}\n\n---\n\n${basePrompt}`;

  return enhanced.replace('{context}', context ?? '');
}

// ── 简易 YAML 解析器（仅处理扁平 key: value） ───────────

function parseSimpleYaml<T>(raw: string): T {
  const obj: Record<string, unknown> = {};
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const sepIdx = trimmed.indexOf(':');
    if (sepIdx === -1) continue;
    const key = trimmed.slice(0, sepIdx).trim();
    let value: unknown = trimmed.slice(sepIdx + 1).trim();

    // 数组格式: [item1, item2]
    if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, ''));
    } else if (typeof value === 'string' && !isNaN(Number(value))) {
      value = Number(value);
    }

    obj[key] = value;
  }
  return obj as T;
}
