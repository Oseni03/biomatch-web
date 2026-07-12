# Issue tracker: Local Markdown

Issues and PRDs for this repo live as markdown files in `contexts/issues/`.

## Conventions

- One file per issue: `contexts/issues/<NN>-<slug>.md`, numbered from `01`
- The PRD issue tracker is `contexts/prd-issues.md`
- Improvement phases are `contexts/phase-*.md`
- Triage state is recorded as a `Status:` line near the top of each issue file (see `triage-labels.md` for the role strings)
- Comments and conversation history append to the bottom of the file under a `## Comments` heading

## When a skill says "publish to the issue tracker"

Create a new file under `contexts/issues/` with the next available `NN` number.

## When a skill says "fetch the relevant ticket"

Read the file at the referenced path. The user will normally pass the path or the issue number directly.
