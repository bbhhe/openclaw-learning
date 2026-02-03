import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SkillLoader } from './skill-loader';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('SkillLoader', () => {
  let tempDir: string;
  let skillDir1: string;
  let skillDir2: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-loader-test-'));
    skillDir1 = path.join(tempDir, 'skills1');
    skillDir2 = path.join(tempDir, 'skills2');
    fs.mkdirSync(skillDir1);
    fs.mkdirSync(skillDir2);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should load skills from multiple directories', () => {
    // Create mock skills
    fs.writeFileSync(path.join(skillDir1, 'skill1.skill'), 'content');
    fs.writeFileSync(path.join(skillDir2, 'skill2.skill'), 'content');

    const loader = new SkillLoader([skillDir1, skillDir2]);
    const skills = loader.loadSkills();

    expect(skills.size).toBe(2);
    expect(skills.has('skill1')).toBe(true);
    expect(skills.has('skill2')).toBe(true);
    expect(skills.get('skill1')?.source).toBe(skillDir1);
    expect(skills.get('skill2')?.source).toBe(skillDir2);
  });

  it('should handle directories with SKILL.md inside folders', () => {
    const complexSkillDir = path.join(skillDir1, 'complex-skill');
    fs.mkdirSync(complexSkillDir);
    fs.writeFileSync(path.join(complexSkillDir, 'SKILL.md'), 'content');

    const loader = new SkillLoader([skillDir1]);
    const skills = loader.loadSkills();

    expect(skills.has('complex-skill')).toBe(true);
  });

  it('should ignore directories that do not exist', () => {
    const loader = new SkillLoader([skillDir1, '/non/existent/path']);
    // Should not throw
    const skills = loader.loadSkills();
    expect(skills).toBeDefined();
  });
});
