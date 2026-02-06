# CLAUDE.md - Universal Knowledge Navigator

## Project Overview
A technical education system built on OpenClaw, using a "Galaxy Topology" to navigate knowledge. It orchestrates multiple agents for assessment, planning, and teaching.

## Core Architecture
- **Orchestrator**: `src/core/orchestrator.ts` - Main entry point for the "Evaluation -> Planning -> Teaching" loop.
- **Swarm Mode**: `src/swarm_interactive.ts` - Multi-agent collaboration UI/Logic.
- **Teaching Engine**: `src/core/teaching/tutor.ts` - Feynman-based teaching controller.
- **Sandbox**: `src/core/sandbox/manager.ts` - Isolated environment for user practice.
- **Knowledge Graph**: `src/core/planning/syllabus.ts` - Dynamic syllabus generation.

## Tech Stack
- **Runtime**: Node.js (v24.11.1)
- **Language**: TypeScript
- **Framework**: OpenClaw (underlying SDK)
- **Testing**: Vitest

## Build & Test Commands
- **Install**: `npm install`
- **Build**: `npm run build` (if applicable)
- **Test All**: `npx vitest`
- **Test Single File**: `npx vitest <path-to-test>`
- **Run Demo**: `npx ts-node src/swarm_interactive.ts`

## Current Focus: Swarm Mode Debugging
- The LLM invocation in Swarm Mode is currently failing/returning empty.
- **Checkpoint**: Verify LLM adapter in `src/swarm_interactive.ts` and its interaction with `NavigatorOrchestrator`.
