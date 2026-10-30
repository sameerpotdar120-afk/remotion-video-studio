# remotion-video-studio

## Core style: Stickman3D (default for story shorts)
Flat drawn stickman characters in a soft-lit procedural 3D world, one-word captions, continuous camera moves - all
visuals made in code (no AI/stock images), 2160x3840 60 fps, delivered as a private GitHub release link.
- Style rules: `docs/styles/stickman3d/STYLE.md`
- Workflow (analysis → build → QA → render → release): `.claude/skills/stickman3d-video/SKILL.md`
- Kit: `src/styles/stickman3d` (import from its index); scripts: `scripts/stickman3d`
- Reference episode: `src/horse` (release `horse-v1`)

## Repo rules
- Develop on the session's assigned branch; commit messages carry the session's attribution trailer, no model IDs.
- Render workers must never share a checkout or temp folder (use `scripts/stickman3d/render_4k.sh`).
- Reference media from the user is for analysis only; never commit it.
