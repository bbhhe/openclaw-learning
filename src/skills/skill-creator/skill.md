# Skill Creator

Use this skill when the user wants to create a new agent skill.

## Steps to Create a Skill

1.  **Understand the Goal**: Identify what the new skill should do (e.g., "search git logs", "check stock prices").
2.  **Create Directory**: Create a new directory in `src/skills/<skill-name>`.
3.  **Create Definition**: Create `src/skills/<skill-name>/skill.md`.
4.  **Write Content**: The `skill.md` should describe:
    - **Description**: What the skill does.
    - **Usage**: How to use it (using available tools like `exec`, `read`, `write`, etc.).
    - **Examples**: Example tool calls.

## Example: Creating a "Time" Skill

1.  Create dir: `mkdir -p src/skills/time`
2.  Write `src/skills/time/skill.md`:
    ```markdown
    # Time Skill

    To get the current time, use the `exec` tool.

    ## Usage
    - Check time: `date`
    ```
