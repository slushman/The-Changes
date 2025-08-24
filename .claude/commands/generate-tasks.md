---
description: Generate detailed task list from existing PRD file
argument-hint: <prd-filename>
allowed-tools: Read(*), Glob(*), Write(*), Grep(*)
---

# Generate Task List from PRD

Create a detailed, step-by-step task list based on an existing Product Requirements Document (PRD) to guide implementation.

## Process

1. **Receive PRD Reference**: User specifies PRD file to analyze
2. **Analyze PRD**: Read functional requirements, user stories, and sections
3. **Assess Current State**: Review codebase for existing infrastructure, patterns, and relevant components
4. **Generate Parent Tasks**: Create high-level tasks required for implementation
5. **Wait for Confirmation**: Present parent tasks and wait for user to respond "Go"
6. **Generate Sub-Tasks**: Break down each parent task into actionable sub-tasks
7. **Identify Relevant Files**: List files to be created or modified (including tests)
8. **Save Task List**: Save as `tasks-[prd-file-name].md` in `/tasks/` directory

## Output Format

```markdown
## Relevant Files

- `path/to/file1.ts` - Brief description of relevance
- `path/to/file1.test.ts` - Unit tests for file1.ts
- `path/to/file2.tsx` - Brief description
- `path/to/file2.test.tsx` - Unit tests for file2.tsx

### Notes

- Unit tests placed alongside code files
- Use `npx jest [optional/path]` to run tests

## Tasks

- [ ] 1.0 Parent Task Title
  - [ ] 1.1 Sub-task description 1.1
  - [ ] 1.2 Sub-task description 1.2
- [ ] 2.0 Parent Task Title
  - [ ] 2.1 Sub-task description 2.1
- [ ] 3.0 Parent Task Title
```

## Interaction Model

Process pauses after generating parent tasks. User must respond with "Go" to proceed to detailed sub-task generation. This ensures high-level plan alignment before diving into implementation details.

## Target Audience

Written for **junior developers** implementing the feature with awareness of existing codebase context.

Example usage:
- `/generate-tasks prd-user-profile-editing.md`
- `/generate-tasks prd-dashboard-analytics.md`