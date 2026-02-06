# Task 04: Sandbox Manager Foundation

## Context
为了让每个星球 Course 拥有独立的运行环境和文件空间，防止不同课程之间的文件冲突和状态污染，我们需要一个沙箱管理器。`SandboxManager` 负责管理这些独立的存储目录。

## Goal
实现 `SandboxManager` 类，用于管理课程沙箱的根目录和生命周期（主要是路径获取和自动创建）。

## File Path
- **Implementation**: `src/core/sandbox/manager.ts`
- **Test**: `src/core/sandbox/__tests__/manager.test.ts`

## Logic
1. **Constructor**:
   - 接收 `rootPath` 参数，默认为 `workspace/sandboxes`。
   - 初始化时确保存储根目录存在。
2. **`getSandboxPath(courseId: string): string`**:
   - 根据 `courseId` 生成对应的子目录路径（绝对路径）。
   - 如果该子目录不存在，则递归创建它。
   - 返回该 Course 的绝对路径。

## Acceptance Criteria
- [ ] `getSandboxPath` 能够根据传入的 `courseId` 返回预期的绝对路径。
- [ ] 调用 `getSandboxPath` 时，如果物理目录不存在，会自动递归创建。
- [ ] 构造函数能够正确处理自定义的 `rootPath`。
- [ ] 单元测试覆盖以上所有核心场景，并确保路径处理的跨平台兼容性（建议使用 `path.resolve`）。

## Implementation Details (Ref)
```typescript
import * as fs from 'node:fs';
import * as path from 'node:path';

export class SandboxManager {
  private rootPath: string;

  constructor(rootPath: string = 'workspace/sandboxes') {
    this.rootPath = path.resolve(rootPath);
    if (!fs.existsSync(this.rootPath)) {
      fs.mkdirSync(this.rootPath, { recursive: true });
    }
  }

  public getSandboxPath(courseId: string): string {
    const sandboxPath = path.join(this.rootPath, courseId);
    if (!fs.existsSync(sandboxPath)) {
      fs.mkdirSync(sandboxPath, { recursive: true });
    }
    return sandboxPath;
  }
}
```
