---
description: Generate a Product Requirements Document (PRD) based on user prompt
argument-hint: [feature description]
allowed-tools: Write(*), Read(*), TodoWrite(*)
---

# Create Product Requirements Document (PRD)

Generate a detailed PRD in Markdown format based on user input, following a structured process.

## Process

1. **Receive Initial Prompt**: User provides brief description or request for new feature
2. **Ask Clarifying Questions**: Gather sufficient detail about "what" and "why" (provide options in lists for easy selection)
3. **Generate PRD**: Create structured document based on responses
4. **Save PRD**: Save as `prd-[feature-name].md` in `/tasks` directory

## Clarifying Questions Areas

- **Problem/Goal**: What problem does this solve? Main objectives?
- **Target User**: Who is the primary user?
- **Core Functionality**: Key actions users should perform?
- **User Stories**: As a [user], I want to [action] so that [benefit]
- **Acceptance Criteria**: How do we know when it's successfully implemented?
- **Scope/Boundaries**: What should this feature NOT do?
- **Data Requirements**: What data needs to be displayed/manipulated?
- **Design/UI**: Existing mockups or desired look and feel?
- **Edge Cases**: Potential error conditions to consider?

## PRD Structure

1. **Introduction/Overview**: Feature description and problem solved
2. **Goals**: Specific, measurable objectives
3. **User Stories**: Detailed user narratives
4. **Functional Requirements**: Numbered, specific functionalities
5. **Non-Goals**: What's explicitly out of scope
6. **Design Considerations**: UI/UX requirements (optional)
7. **Technical Considerations**: Constraints, dependencies (optional)
8. **Success Metrics**: How success will be measured
9. **Open Questions**: Remaining areas needing clarification

## Target Audience

Written for **junior developers** - requirements should be explicit, unambiguous, and avoid jargon.

Example usage:
- `/create-prd "user authentication system"`
- `/create-prd "dashboard analytics feature"`