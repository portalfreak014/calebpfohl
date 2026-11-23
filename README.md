# calebpfohl

Personal workspace containing a website, Arabic-learning tools, and other web projects.

## Repository map

- `index.html` and root HTML/media files: site entry point and standalone projects/pages. These are separate from the Arabic application; the Arabic Compass is not a complete specification of their behavior.
- `arabic/`: Arabic study application, vocabulary sources, shared scripts, assets, and documentation.
- `scripts/`: preparation and maintenance scripts; some transform the deployment workspace rather than committing generated changes.
- `netlify.toml` and `netlify/`: deployment configuration and related integration. Consult actual configuration before changing routes or services.
- `docs/`: repository-level documentation, distinct from `arabic/docs/`.

## Start here for the Arabic site

Read [Project Compass](arabic/docs/PROJECT_COMPASS.md), then the [documentation index](arabic/docs/README.md). The approved rebrand is Fursa; migration is not assumed complete. See [branding](arabic/docs/BRANDING.md).

Changes within `arabic/` require explicit authorization. This is an active application, not only a materials archive. Keep unrelated projects out of scope.

## Working conventions

- Specify target files and whether changes should be committed or proposed first.
- Make focused edits and descriptive commits; document implementation separately from production verification.
- Keep secrets and private credentials out of source control. Use environment variables and examples where appropriate.
- Document dependencies, setup, and run commands for new projects.
- Read `AGENTS.md` for authoritative glossary workflow.

## Arabic vocabulary contract

Human-maintained Markdown in `arabic/data/glossary/` is authoritative for glossary coverage. Structured chapter JSON and unit JSON are downstream representations; inspect the relevant consumer before changing formats.

For new structured entries, use `arabic/data/templates/vocabulary-entry.template.json`, template version `2.0.0`. Required fields are `id`, `arabic`, `lemma`, `glosses`, `partOfSpeech`, `chapter`, and `unit`. Use optional `forms` for morphology. Part-of-speech-specific templates are legacy reference only. Validate JSON and do not commit unreviewed vocabulary to live content.
