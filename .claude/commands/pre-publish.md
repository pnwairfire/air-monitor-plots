---
description: Bump version, update changelog, run tests, tag commit, and hand off to developer for push and publish.
allowed-tools: Read, Edit, Bash
---

Prepare this project for a new release. Follow each step in order and stop
immediately if any step fails.

## Step 1 — Determine the new version

<!-- TODO: Replace with the file and field that holds the current version.
     Examples:
     - JavaScript: read `"version"` from `package.json`
     - Python: read `version` from `pyproject.toml` or `setup.cfg`
     - R: read `Version:` from `DESCRIPTION`
-->

Read the current version from `<!-- TODO: version file -->`. Compute the next
version (patch, minor, or major — ask the developer if unclear). Show both
versions before continuing.

## Step 2 — Summarize changes since the last release

Run:

```
git log $(git describe --tags --abbrev=0)..HEAD --oneline
```

Read the output and identify the meaningful changes. Group them into:
- Bug fixes
- New features or behavior changes
- Documentation or tooling changes

Use this as the basis for the changelog entry in Step 4.

## Step 3 — Bump the version

<!-- TODO: Replace with the file and field to update.
     Edit only the version field; do not change anything else.
-->

Edit `<!-- TODO: version file -->` to update the version to the new value.
Do not change anything else in the file.

## Step 4 — Update the changelog

<!-- TODO: Replace with your changelog file name (NEWS.md, CHANGELOG.md, etc.)
     and the format you use. Example format shown below.
-->

Add a new entry at the top of `<!-- TODO: changelog file -->` using this format:

```
# <project-name> <new-version>

- <short bulleted description of change 1>
- <short bulleted description of change 2>
```

Keep bullets concise (one line each). Use plain language. Do not copy commit
messages verbatim — summarize the intent and effect of each change.

Mark breaking changes explicitly: **Breaking:** ...

## Step 5 — Rebuild documentation

<!-- TODO: Replace with the command to regenerate docs, or remove this step
     if your project does not generate documentation from source.
-->

Run:

```
<!-- TODO: doc generation command -->
```

If it fails, stop and report the error.

## Step 6 — Run tests

<!-- TODO: Replace with your test command. -->

Run:

```
<!-- TODO: test command -->
```

If any tests fail, stop and report the failures. Do not proceed.

## Step 7 — Tag and commit

If Steps 5 and 6 both passed, run:

```
git tag <new-version>
git commit -a -m "Bump to <new-version>: <one-line summary of changes>"
```

The commit message summary should be concise (under 72 characters) and describe
what changed functionally, not just "bump version".

## Step 8 — Handoff to developer

Print the following instructions exactly, substituting the real version number
and the correct push/publish commands for this project:

---

**Release `<new-version>` is staged. To publish, run:**

```
git push
git push origin <new-version>
<!-- TODO: publish command (e.g. npm publish --access public, twine upload dist/*, etc.) -->
```

**Do not publish until `git push` has succeeded.**

---

Do not run `git push` or any publish command yourself under any circumstances.
