# Coding Agent (Process Manager)

Use **bash** (background mode) to run coding agents like Claude Code or Codex. This allows for interactive sessions (answering prompts) and long-running tasks.

## Supported Agents

1.  **Claude Code** (`claude`)
2.  **Codex CLI** (`codex`)

## Usage Pattern

### 1. Start the Session
Use the `bash` tool to start the agent in the background.

```json
{
  "name": "bash",
  "arguments": {
    "command": "claude 'Refactor src/utils.ts'",
    "workdir": "/path/to/project"
  }
}
```
**Returns**: `Started background session. ID: <sessionId>`

### 2. Monitor Logs
Check what the agent is doing.

```json
{
  "name": "process",
  "arguments": {
    "action": "log",
    "sessionId": "<sessionId>"
  }
}
```

### 3. Interact (Answer Prompts)
If the agent asks "Do you want to proceed? [y/N]", send the answer.

```json
{
  "name": "process",
  "arguments": {
    "action": "write",
    "sessionId": "<sessionId>",
    "data": "y\n"
  }
}
```
*Note: Don't forget the `\n` (newline) to simulate pressing Enter.*

### 4. Kill Session
When finished or if stuck.

```json
{
  "name": "process",
  "arguments": {
    "action": "kill",
    "sessionId": "<sessionId>"
  }
}
```

## Tips

- **Interactive Mode**: Unlike simple `exec`, this method allows you to respond to the agent's questions.
- **Output**: Since this runs without a full Pseudo-Terminal (PTY), the output might lack colors or look raw. This is normal.
- **One-Shot**: For simple queries, you can still use `exec command:"claude 'query'"` if you don't expect prompts.
