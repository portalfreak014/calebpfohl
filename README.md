# calebpfohl

Personal workspace for programming, coding experiments, and web projects.

## Repository layout

- `arabic/` — Existing Arabic documentation and materials. **Do not modify this directory.**
- Root HTML, media, and configuration files — Existing site pages, assets, and deployment configuration.

## Working conventions

- Keep new programming work organized in clearly named top-level directories or project-specific folders.
- Add a short README to each new project explaining its purpose, setup, and how to run it.
- Do not commit secrets, API keys, credentials, or `.env` files. Use environment variables and provide an `.env.example` when needed.
- Keep dependencies and run commands documented in each project's README.
- Make focused commits with descriptive messages.

## Suggested structure for new work

```text
projects/
  project-name/
    README.md
    src/
    tests/
    .env.example
```

## Notes for AI-assisted work

When asking an AI assistant to work in this repository, specify the target files and whether changes should be made directly or proposed first. The `arabic/` directory is out of scope unless explicitly authorized.

## Arabic vocabulary schema

Changes within `arabic/` require explicit authorization. For new vocabulary entries, use the part-of-speech-agnostic template at `arabic/data/templates/vocabulary-entry.template.json`.

- Use `templateVersion: "2.0.0"` for all new vocabulary entries.
- Required fields are `id`, `arabic`, `lemma`, `glosses`, `partOfSpeech`, `chapter`, and `unit`.
- Use the optional `forms` object for morphology only when needed, such as verb forms, noun plurals, or adjective gender variants.
- The part-of-speech-specific templates are retained for reference only; they are legacy schemas and must not be used for new entries.
- Prefer focused, additive edits, and validate JSON before committing vocabulary changes.
