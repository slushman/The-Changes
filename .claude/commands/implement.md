---
description: Implement specification card or task from project specs/tasks
argument-hint: <card_id_or_task_number>
allowed-tools: Glob(*), Read(*), TodoWrite(*), Write(*), Edit(*), MultiEdit(*), Bash(npm:*), Bash(git:*)
---

# Implement Specification or Task

Implement the specified card from `/specs/` directory or task from `/tasks/` directory following acceptance criteria or task list.

## Input Formats

- **Spec Card**: `1.1.1` (epic.story.card) or `epic-1-card-1.1.1`
- **Task Number**: `1.1` or `2.3` (parent.subtask from task list)

## Workflow for Spec Cards

1. **Parse card ID**: Convert `$ARGUMENTS` to find the correct spec file
2. **Read specification**: Load card from `/specs/epic-*/card_*.md`
3. **Create todo list**: Extract acceptance criteria and create TodoWrite entries
4. **Check dependencies**: Verify prerequisite cards are implemented
5. **Implement systematically**: Work through each acceptance criterion
6. **Validate**: Run tests, type-check, lint as specified in card
7. **Mark complete**: Update todos as each criterion is met

## Workflow for Task Lists

1. **Locate task list**: Find matching task file in `/tasks/` directory
2. **Identify task**: Find the specific task number requested
3. **One sub-task at a time**: Implement only the specified sub-task
4. **Wait for permission**: Ask user for approval before starting next sub-task
5. **Follow completion protocol**: Mark tasks complete and commit when parent task is done

## Task Implementation Protocol

- **One sub-task at a time**: Do NOT start next sub-task until user says "yes" or "y"
- **Completion protocol**:
  1. Mark finished sub-task as `[x]` immediately
  2. If ALL subtasks under parent are `[x]`:
     - Run full test suite (`npm test`, `pytest`, etc.)
     - Stage changes (`git add .`) only if tests pass
     - Clean up temporary files and code
     - Commit with conventional format using `-m` flags:
       ```
       git commit -m "feat: add payment validation" -m "- Validates card type" -m "- Adds unit tests" -m "Related to T123"
       ```
  3. Mark parent task `[x]` once all subtasks committed
- **Update task list file** after each sub-task completion
- **Maintain "Relevant Files"** section with accurate file descriptions

## Implementation Standards

- Follow all code standards from CLAUDE.md
- Use TypeScript strict mode, avoid type casting
- Implement WCAG 2.2 AA accessibility requirements
- Add proper error handling and validation
- Test incrementally as you build
- Ensure all criteria are met before completion

Example usage:
- `/implement 1.1.1` - Implement spec card 1.1.1
- `/implement 2.1` - Implement task 2.1 from task list
- `/implement 1.3` - Implement subtask 1.3