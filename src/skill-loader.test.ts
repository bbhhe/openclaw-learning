import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SkillLoader } from './skill-loader';
import fs from 'fs';
import path from 'path';

// Mock fs and path
vi.mock('fs');

describe('SkillLoader', () => {
    const mockDir = '/mock/skills';

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should return empty string if dir does not exist', () => {
        vi.mocked(fs.existsSync).mockReturnValue(false);
        const loader = new SkillLoader(mockDir);
        expect(loader.loadSkills()).toBe('');
    });

    it('should load skills from flat .md files', () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        // Mock readdirSync to return Dirent objects (for withFileTypes: true)
        const mockEntry = {
            name: 'git.md',
            isFile: () => true,
            isDirectory: () => false
        } as fs.Dirent;
        
        vi.mocked(fs.readdirSync).mockReturnValue([mockEntry] as any);
        vi.mocked(fs.readFileSync).mockReturnValue('Git Skill Content');

        const loader = new SkillLoader(mockDir);
        const result = loader.loadSkills();

        expect(result).toContain('### Skill: git');
        expect(result).toContain('Git Skill Content');
    });

    it('should load skills from subdirectories (skill.md)', () => {
        vi.mocked(fs.existsSync).mockReturnValue(true); // For main dir and skill.md check
        
        const mockEntry = {
            name: 'weather',
            isFile: () => false,
            isDirectory: () => true
        } as fs.Dirent;

        vi.mocked(fs.readdirSync).mockReturnValue([mockEntry] as any);
        vi.mocked(fs.readFileSync).mockReturnValue('Weather Skill Content');

        const loader = new SkillLoader(mockDir);
        const result = loader.loadSkills();

        expect(result).toContain('### Skill: weather');
        expect(result).toContain('Weather Skill Content');
        // Verify path construction
        expect(fs.readFileSync).toHaveBeenCalledWith(
            path.join(mockDir, 'weather', 'skill.md'), 
            'utf-8'
        );
    });
});
