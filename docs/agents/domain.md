# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`contexts/architecture.md`** — authoritative domain doc covering tech stack, data model, routing, patterns
- **`AGENTS.md`** — agent context with project overview, conventions, and active plans

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront.

## File structure

Single-context repo:

```
/
├── AGENTS.md
├── contexts/
│   ├── architecture.md
│   └── current-structure.md
└── docs/agents/
    └── domain.md
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `contexts/architecture.md`. Don't drift to synonyms the glossary explicitly avoids.
