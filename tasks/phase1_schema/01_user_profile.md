# Task 01: Define User Profile Schema

## Context
The system architecture (`docs/design/architecture_v1.md`) defines the User Profile data model using a layered structure.

**Reference Data Structure:**
```json
{
  "static_profile": { "role": "Fullstack Dev", "goals": ["Master AI Agents", "Learn Rust"] },
  "cognitive_profile": { "learning_style": "HANDS_ON", "feedback_preference": "DIRECT" },
  "skill_matrix": { "java": 0.8, "openclaw": 0.3, "system_design": 0.6 }
}
```

## Goal
Create a TypeScript definition file that formally defines this structure using Interfaces.

## File Path
`src/core/types/profile.ts`

## Instructions
1.  **Create directory structure** if it doesn't exist: `src/core/types/`.
2.  **Create file** `src/core/types/profile.ts`.
3.  **Define the following Interfaces**:
    - `StaticProfile`: Contains `role` (string) and `goals` (string array).
    - `CognitiveProfile`: Contains `learning_style` (string union: 'HANDS_ON' | 'THEORETICAL') and `feedback_preference` (string union: 'DIRECT' | 'ENCOURAGING').
    - `SkillMatrix`: A record mapping skill names (string) to proficiency scores (number).
    - `UserProfile`: The root interface composing the above three components.
4.  **Export** all interfaces.

## Acceptance Criteria
- [ ] File exists at `src/core/types/profile.ts`.
- [ ] Root interface `UserProfile` strictly contains `static_profile`, `cognitive_profile`, and `skill_matrix`.
- [ ] TypeScript syntax is valid and strict (no `any`).
