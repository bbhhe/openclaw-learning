# 如何添加新技能 (Skills)

在 OpenClaw 中，"Skill" 本质上就是教 AI 如何使用它已有的工具（主要是 `exec`）来完成新任务的说明书。

## 步骤

1.  在 `src/skills/` 目录下新建一个 `.md` 文件，例如 `git.md`。
2.  使用 Markdown 格式编写说明。

## 模板

```markdown
# 技能名称 (例如: Git Version Control)

这里写一段简介，告诉 AI 这个技能是干嘛的。

## 核心指令 (Instructions)

告诉 AI 在什么情况下，应该运行什么命令。

- 当用户想看状态时: 运行 `git status`
- 当用户想提交代码时: 运行 `git add . && git commit -m "..."`
- 当用户想推送到远程时: 运行 `git push`

## 注意事项

- 记得先检查当前是不是 git 仓库。
- 如果命令失败，请把错误信息告诉用户。
```

## 例子：系统监控 (`monitor.md`)

```markdown
# System Monitor

Use 'exec' to check system health.

- CPU/Memory: `top -b -n 1 | head -n 10`
- Disk Usage: `df -h`
- Network: `ip addr`
```

保存文件后，**重启 Gateway** (`npm run gateway`)，AI 就会自动学会这个新技能了！
