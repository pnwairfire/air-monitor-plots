---
description: Review all documentation layers for completeness, consistency, and alignment with source code. Catches drift between inline comments and user-facing docs.
allowed-tools: Read, Bash
---

Please review all documentation in this project for completeness and alignment.

## Scope

Review the documentation layers for this project:

<!-- TODO: Replace with your project's documentation layers. Examples:

     1. **Inline documentation** — comments in source files, docstrings, JSDoc,
        roxygen2, etc.
     2. **Markdown** — README.md, NEWS.md (or CHANGELOG.md), CLAUDE.md,
        .claude/CLAUDE_ARCHITECTURE.md
     3. **Generated docs** — any HTML documentation generated from inline comments
     4. **Cross-project docs** — .claude/CLAUDE_STYLE_GUIDE.md
-->

## Checks for Alignment

- **Function signatures:** Do exported function names, parameters, and return
  shapes in README and CLAUDE.md match the inline documentation in source files?
- **Breaking changes:** Are breaking changes listed in the changelog also
  reflected in updated inline docs and README examples?
- **Renamed symbols:** When a function or type is renamed, verify the old name
  does not appear in Markdown documentation (other than in changelog history).
- **Units and conventions:** Do units, data format requirements, and
  missing-value conventions described in README/CLAUDE match the inline docs?
- **Examples:** Do inline doc examples match the usage patterns shown in README?
- **Missing prerequisites:** Does README clearly state any required setup,
  runtime dependencies, or environment assumptions?

## Identify

- Missing or incomplete inline documentation (missing parameters, return types,
  units, or examples)
- Stale inline documentation (references renamed functions or outdated behavior)
- Inconsistent conventions between Markdown files and inline docs
- Missing examples or unclear usage instructions
- Confusing or contradictory sections
- Outdated information (especially after version bumps or renames)
- Links or cross-references that are broken or dangling

## Provide

Suggested improvements, with:
- File and line number (or section name)
- What the drift or gap is
- How to fix it
- Priority (high / medium / low)

Do not modify any files.
