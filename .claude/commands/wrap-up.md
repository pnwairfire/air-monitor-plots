---
description: End-of-session checklist — run tests, build, docs, and summarize git status. Run before pushing to a remote or publishing.
allowed-tools: Read, Bash
---

Please run the end-of-session checklist for this project:

<!-- TODO: Replace the numbered steps below with the correct commands for your
     project. The structure (test → build → docs → git status → summary) is
     universal; only the commands change.

     Example for a JavaScript/npm project:
     1. Run `npm test` and confirm all tests pass. If any fail, report them and stop.
     2. Run `npm run build` to verify the build completes cleanly.
     3. Run `npm run docs` to regenerate documentation.
     4. Run `git status` and summarize any uncommitted changes.
     5. If there are staged or unstaged changes, show a `git diff` summary and
        ask whether I want to commit them.
     6. Report the current version from `package.json` and the most recent entry
        in `NEWS.md`.

     Example for a Python project:
     1. Run `pytest` and confirm all tests pass. If any fail, report them and stop.
     2. Run the build step (e.g. `python -m build`) if applicable.
     3. Run `sphinx-build` or equivalent to regenerate docs, if applicable.
     4. Run `git status` and summarize any uncommitted changes.
     5. If there are staged or unstaged changes, show a `git diff` summary and
        ask whether I want to commit them.
     6. Report the current version from `pyproject.toml` (or equivalent) and the
        most recent entry in `CHANGELOG.md`.
-->

1. Run tests and confirm all pass. If any fail, report them and stop.
2. Run the build step to verify the project builds cleanly, if applicable.
3. Regenerate documentation, if applicable.
4. Run `git status` and summarize any uncommitted changes.
5. If there are staged or unstaged changes, show a `git diff` summary and ask
   whether I want to commit them.
6. Report the current version and the most recent changelog entry.

Do not commit, push, or modify any files unless I explicitly ask.
