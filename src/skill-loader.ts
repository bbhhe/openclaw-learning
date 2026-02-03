import * as fs from 'fs';
import * as path from 'path';

export interface Skill {
  name: string;
  path: string;
  source: string;
}

export class SkillLoader {
  private directories: string[];

  constructor(directories: string[]) {
    this.directories = directories;
  }

  loadSkills(): Map<string, Skill> {
    const skills = new Map<string, Skill>();

    for (const dir of this.directories) {
      if (!fs.existsSync(dir)) {
        console.warn(`[SkillLoader] Directory not found: ${dir}`);
        continue;
      }

      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          let skillName: string | null = null;
          let skillPath: string = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            // Check for SKILL.md inside the directory
            if (fs.existsSync(path.join(skillPath, 'SKILL.md'))) {
              skillName = entry.name;
            }
          } else if (entry.isFile() && entry.name.endsWith('.skill')) {
            skillName = entry.name.replace('.skill', '');
          }

          if (skillName) {
            console.log(`[SkillLoader] Loading skill '${skillName}' from ${dir}`);
            skills.set(skillName, { name: skillName, path: skillPath, source: dir });
          }
        }
      } catch (err) {
        console.error(`[SkillLoader] Error reading directory ${dir}:`, err);
      }
    }
    return skills;
  }
}
