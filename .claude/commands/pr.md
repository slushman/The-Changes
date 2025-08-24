---
description: Create pull request with all changes, run pre-commit hooks
argument-hint: [title]
allowed-tools: Bash(git:*), Bash(npm:*), Bash(gh:*)
---

# Create Pull Request

Create a pull request with all current changes, running pre-commit validation and auto-fixing issues.

## Workflow

1. **Analyze changes**: Review all modified, added, and untracked files using `git status` and `git diff`
2. **Run pre-commit hooks**: Execute linting (`npm run lint`), type-checking (`npm run type-check`), tests (`npm test`)
3. **Auto-fix issues**: Run `npm run lint -- --fix`, `npm run format`, fix any auto-fixable problems
4. **Generate commit message**: Create structured commit message from changes using conventional commits format
5. **Create branch**: Generate feature branch name based on changes (e.g., `feat/github-oauth-integration`)
6. **Commit and push**: Stage all files, commit with generated message, push to remote
7. **Create GitHub PR**: Use `gh pr create` with comprehensive description and test plan

## Commit Message Format

```
type(scope): brief description

- Detailed change 1
- Detailed change 2
- Detailed change 3

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## PR Description Template

- Summary of changes and purpose
- Checklist of changes made
- Testing checklist
- Epic/Card references
- Breaking changes (if any)
- Deployment notes

Example usage:
- `/pr` - Auto-generate title and description
- `/pr "Add user authentication"` - Custom title
- `/pr "Feature: Prompt tagging system"` - Descriptive title