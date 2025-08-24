---
description: Add changes to existing PR, run pre-commit hooks
argument-hint: [message]
allowed-tools: Bash(git:*), Bash(npm:*), Bash(gh:*)
---

# Commit to Existing PR

Add changes to an existing pull request, running pre-commit validation and auto-fixing issues.

## Workflow

1. **Branch validation**: Check if on feature branch (not main/master) with `git branch --show-current`
2. **Verify PR exists**: Confirm branch has associated PR using `gh pr view`
3. **Analyze changes**: Review all modified, added, and untracked files
4. **Run pre-commit hooks**: Execute linting, type-checking, tests (same as PR command)
5. **Auto-fix issues**: Fix linting issues, format code, re-run validation
6. **Generate commit message**: Create focused message for incremental changes
7. **Commit and push**: Stage all files, commit, push to current branch (updates existing PR)
8. **Update PR description**: Optionally add section about recent changes

## Safety Checks

- Prevents commits to main/master branches
- Warns if no PR exists for current branch
- Suggests using `/pr` command if no PR found
- Handles merge conflicts and push failures

## Commit Message Format

For incremental commits, use specific types:
- `fix`: Bug fixes and corrections
- `refactor`: Code improvements without functionality changes
- `test`: Adding or updating tests
- `docs`: Documentation updates
- `style`: Code formatting and style changes
- `perf`: Performance improvements

Example usage:
- `/commit` - Auto-generate commit message
- `/commit "Fix validation bug"` - Custom message
- `/commit "test: add edge case coverage"` - Specific type