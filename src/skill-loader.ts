import fs from 'fs';
import path from 'path';

export class SkillLoader {
    private skillsDir: string;

    constructor(dir: string) {
        this.skillsDir = dir;
    }

    loadSkills(): string {
        if (!fs.existsSync(this.skillsDir)) {
            console.warn(`⚠️ Skills directory not found: ${this.skillsDir}`);
            return "";
        }

        let prompt = "## Available Skills\n\n";
        const entries = fs.readdirSync(this.skillsDir, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.isDirectory()) {
                const skillFile = path.join(this.skillsDir, entry.name, 'skill.md');
                if (fs.existsSync(skillFile)) {
                    const content = fs.readFileSync(skillFile, 'utf-8');
                    prompt += `### Skill: ${entry.name}\n${content}\n\n---\n\n`;
                    console.log(`📚 Loaded skill: ${entry.name}/skill.md`);
                }
            } else if (entry.isFile() && entry.name.endsWith('.md')) {
                const content = fs.readFileSync(path.join(this.skillsDir, entry.name), 'utf-8');
                prompt += `### Skill: ${entry.name.replace('.md', '')}\n${content}\n\n---\n\n`;
                console.log(`📚 Loaded skill: ${entry.name}`);
            }
        }

        return prompt;
    }
}
