# Workflow Template Repository

This repository contains a reusable agent-centric workflow template with required docs and issue/task templates. Use this repository as a GitHub template for future projects.

Quick goals:
- Keep workflow rules, safety policies, and command templates intact.
- Provide a simple `setup.sh` to help fill project-specific metadata into `CLAUDE.md`.

Files you should see in the root:
- `AGENTS.md` — agent workflow, safety rules and implementation checklist
- `CLAUDE.md` — workflow and project metadata (template placeholders)
- `docs/ISSUE-TEMP.md` — context issue template
- `docs/TASK-ISSUE-TEMP.md` — atomic task issue template
- `docs/KNOWLEDGE-TEMP.md` — knowledge capture template
- `.claude/commands/` — slash command definitions (if included)
- `setup.sh` — interactive setup helper (run after cloning to fill project metadata)

Quick start (macOS, zsh)

1) Clone this repo as a template for your project:

```bash
git clone https://github.com/<your-account>/<template-repo>.git my-project
cd my-project
```

2) Run the setup helper to populate `CLAUDE.md` with project metadata. The script will ask for your repository URL and the `claude` CLI alias (if you use a custom alias):

```bash
./setup.sh
```

Notes about the setup script
- The script attempts to call your `claude` CLI with `-p` and a prompt that instructs the assistant to fill top-level metadata while preserving workflow sections. If your claude CLI uses a different flag or interface, provide the correct alias that wraps it accordingly.
- If the `claude` CLI is not available, the script can run in offline/manual mode and create a temporary file for manual editing.
- The script always shows a diff and requires confirmation before overwriting `CLAUDE.md`.

How to adapt the template for your stack
- Replace placeholder tokens such as `[PROJECT_NAME]`, `[REPOSITORY_URL]`, `[PRIMARY_LANGUAGE]`, `[FRAMEWORK]` with real values.
- Update `docs/TASK-ISSUE-TEMP.md` build/test commands to match your stack (for example, replace `[build command]` and `[test command]`).

Optional next steps to make this a polished template repository:
- Add a LICENSE (MIT recommended) and `CONTRIBUTING.md`.
- Add `.github/ISSUE_TEMPLATE/*` and `PULL_REQUEST_TEMPLATE.md` for repo-level automation.
- Add a minimal CI workflow that validates docs and runs basic checks.

If you want, I can implement any of the optional steps above (LICENSE, CONTRIBUTING, GitHub meta, CI). Tell me which one to start with.
