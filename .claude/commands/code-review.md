---
description: Comprehensive project-wide code review covering correctness, data conventions, test coverage, API stability, and documentation. Run before any version bump.
allowed-tools: Read, Bash
---

Please conduct a comprehensive code review of this project.

## Scope

Review the entire codebase as a cohesive system. Reference these files for
context on design decisions, review priorities, and communication expectations:

- `.claude/CLAUDE_ARCHITECTURE.md` — module dependencies, design decisions, API contract
- `.claude/CLAUDE_STYLE_GUIDE.md` — review priorities and communication style
- `CLAUDE.md` — project conventions and constraints

<!-- TODO: List the directories and files that make up the scope of this review.
     Example:
     - **Source:** `src/` — all modules
     - **Tests:** `tests/` — all test files
     - **Examples:** `examples/` — runnable demos
-->

## Critical Areas for This Project

<!-- TODO: Replace this section with the critical areas specific to your project.
     What would a domain expert look for that a generic reviewer might miss?
     Examples of subsections:

     ### Algorithm Correctness
     Are the core algorithms faithful to their specification? Are the quirks
     and edge cases documented and handled?

     ### Data Conventions (Load-Bearing)
     Are the foundational data assumptions preserved throughout? (Types,
     missing-value representation, ordering, units.) Are they relied on by
     downstream consumers?

     ### Input Validation and Error Handling
     Does validation fail fast with helpful messages? Is there any risk of
     silent failure?

     ### API Stability and Backward Compatibility
     Are public function names, signatures, and return shapes preserved?
     Would any change break downstream consumers?

     ### Testing and Edge Cases
     Are critical edge cases tested? Are error paths tested?
-->

## Provide

For each issue found, provide:

1. **Location** — file and line number (or section name)
2. **Issue** — what is wrong or could be better
3. **Priority** — high / medium / low
   - **High:** correctness bug, missing critical test, backward-compatibility risk, security issue
   - **Medium:** clarity, maintainability, edge case not covered
   - **Low:** style, minor optimization, nice-to-have improvement
4. **Suggested fix** — concise recommendation
5. **Why** — brief rationale (references to design decisions or maintainer philosophy are helpful)

## Do Not

- Propose major architectural rewrites unless a clear problem exists.
- Suggest adding dependencies without strong justification.
- Recommend optimizations unless performance is a demonstrated problem.
- Assume the codebase needs refactoring; small, incremental improvements are preferred.

Do not modify any files.
