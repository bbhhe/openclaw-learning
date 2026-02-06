# Task: Implement Global Memory Bridge

## Context
The **Global Memory Bridge** is a core component defined in `docs/design/architecture_v1.md`. Its purpose is to provide a unified way for various agents within the system to access shared user metadata. By loading cross-course user preferences and cognitive profiles, the Bridge ensures that every agent (from the Feynman Tutor to the Practice Coach) can tailor its interactions based on a consistent understanding of the user's background, learning style, and goals.

## Goal
Implement a `MemoryBridge` class that acts as the data provider for user information. It will be responsible for:
1. Loading the user profile from a persistent JSON file (`workspace/storage/user_profile.json`).
2. Providing a `getAgentContext()` method that returns a formatted string suitable for inclusion in an agent's System Prompt.

## File Path
- **Target Implementation**: `src/core/memory/bridge.ts`
- **Unit Test**: `tests/core/memory/bridge.test.ts` (or similar, depending on project structure)

## Logic Requirements
The `MemoryBridge` class should implement the following logic:
- **Initialization**: Attempt to locate the `workspace/storage/user_profile.json` file.
- **File Access**: Check if the JSON file exists.
- **Parsing**:
    - If the file exists, read and parse its content into a `UserProfile` object (referencing the definition in `src/core/types/profile.ts`).
    - Handle potential JSON parsing errors gracefully.
- **Defaulting**: If the file does not exist or is invalid, use a sensible default `UserProfile` or handle the missing context appropriately.
- **`getAgentContext()`**:
    - Extract relevant fields from the `UserProfile` (e.g., role, learning style, feedback preference).
    - Format this data into a clear, concise string (e.g., Markdown or structured text) that can be appended to a System Prompt.

## Acceptance Criteria
- [ ] `MemoryBridge` class exists in `src/core/memory/bridge.ts`.
- [ ] The class successfully reads `workspace/storage/user_profile.json`.
- [ ] `getAgentContext()` returns a string that accurately reflects the contents of the user profile.
- [ ] The implementation handles missing or malformed JSON files without crashing.

## Unit Test Requirements
- **Test Case 1: Success Path** - Mock a valid `user_profile.json` and verify `getAgentContext()` returns the expected formatted string.
- **Test Case 2: Missing File** - Verify that the bridge handles a missing file gracefully (e.g., returning an empty context or a default one).
- **Test Case 3: Invalid JSON** - Verify that malformed JSON doesn't crash the system and is handled properly.
- **Test Case 4: Formatting** - Ensure the output string of `getAgentContext()` is correctly formatted for an LLM prompt.
