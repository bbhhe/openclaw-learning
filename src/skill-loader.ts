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

        const files = fs.readdirSync(this.skillsDir).filter(f => f.endsWith('.md'));
        let prompt = "## Available Skills\n\n";

        for (const file of files) {
            const content = fs.readFileSync(path.join(this.skillsDir, file), 'utf-8');
            prompt += `### Skill: ${file.replace('.md', '')}\n${content}\n\n---\n\n`;
            console.log(`📚 Loaded skill: ${file}`);
        }

        return prompt;
    }
}
