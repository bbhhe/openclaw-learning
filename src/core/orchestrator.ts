import { UserProfile } from './types/profile';
import { SyllabusGenerator, Syllabus } from './planning/syllabus';
import { TutorController } from './teaching/tutor';
import path from 'path';

/**
 * NavigatorOrchestrator
 * 全域知识领航者的总调度器
 */
export class NavigatorOrchestrator {
  private syllabusGenerator: SyllabusGenerator;
  private tutorController: TutorController;
  private currentSyllabus?: Syllabus;

  constructor() {
    this.syllabusGenerator = new SyllabusGenerator();
    this.tutorController = new TutorController();
  }

  /**
   * 初始化教学流程
   */
  public async init(profile: UserProfile, knowledgeKey: string): Promise<void> {
    const knowledgePath = path.join(process.cwd(), `workspace/knowledge/${knowledgeKey}.json`);
    this.currentSyllabus = this.syllabusGenerator.generateFromFile(profile, knowledgePath);
  }

  /**
   * 获取当前大纲
   */
  public getSyllabus(): Syllabus | undefined {
    return this.currentSyllabus;
  }

  /**
   * 正式开课
   */
  public start(): string {
    if (!this.currentSyllabus || this.currentSyllabus.modules.length === 0) {
      throw new Error("Syllabus not initialized. Call init() first.");
    }

    const firstModule = this.currentSyllabus.modules[0];
    return this.tutorController.startModule(firstModule);
  }
}
