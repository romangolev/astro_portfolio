---
title: "pyRevit"
description: "Authored pyRevit's C# loader rewrite and its MCP agent runtime, which lets coding agents drive a live Revit model under in-Revit approval."
repo: "pyrevitlabs/pyRevit"
weight: 0
draft: false
date: 2026-10-06
technologies: ["C#", ".NET", "Python", "RevitAPI", "WPF", "MCP"]
tags: ["BIM", "Revit", "C#", "Python", "Open Source", "AI"]
---

pyRevit is a Rapid Application Development environment for Autodesk Revit, used by AEC teams to build and run Python-based tools without a compile step. I work on two layers of its runtime: the C# loader that starts the application and builds its UI, and the MCP agent runtime that lets coding agents operate a live model safely.

## The C# loader (pyRevit 6 → 7)

I authored the loader rewrite ([#2647](https://github.com/pyrevitlabs/pyRevit/pull/2647)), merged in January 2026: 305 commits, 226 files, +20,863/−240. It replaced the Python bootstrap with typed C# services for assembly building, session management, UI construction and extension parsing.

- Default loader in pyRevit 6.0; the legacy IronPython loader was removed in 7.0, leaving a C#-only startup path on Revit 2021–2027.
- Multi-targets .NET Framework 4.8 and .NET 8, with assembly caching and type-safe extension configuration.
- Backed by the NUnit 4 suite in `pyRevitExtensionParserTester` (426 test methods across both target frameworks), covering parsing, UI components, hooks, localization, engines and regression cases.
- Continued with loader/runtime work in 7.0: startup performance ([#3580](https://github.com/pyrevitlabs/pyRevit/pull/3580)), pre-2021 cleanup ([#3585](https://github.com/pyrevitlabs/pyRevit/pull/3585)), dark-mode panels ([#3634](https://github.com/pyrevitlabs/pyRevit/pull/3634)), Routes reload fixes ([#3691](https://github.com/pyrevitlabs/pyRevit/pull/3691)) and signed-build integration tests ([#3721](https://github.com/pyrevitlabs/pyRevit/pull/3721)).

## The MCP agent runtime (pyRevit 7)

I authored the agent runtime ([#3684](https://github.com/pyrevitlabs/pyRevit/pull/3684), [#3709](https://github.com/pyrevitlabs/pyRevit/pull/3709)), shipped as an opt-in, experimental feature in pyRevit 7.0. It exposes a live Revit model to Claude Code, Codex, Cursor, VS Code and OpenCode over MCP — as Python programs, not a tool per API call.

- Tools: `get_context`, `inspect_elements`, `lookup_revit_api`, `show_elements`, `capture_view`, `run_query`, `run_modify`, `get_run`, `get_skill`.
- Guarded execution: `readonly` / `ask` / `auto` policies, approval inside Revit, one undo entry per approved run, timeouts between Python lines, transaction checks, document binding and rollback of failed runs.
- Nine shipped skills teach the agent the Revit API, `pyrevitlib` / `rpw`, families, schedules, views, drawings and extension authoring.

## Why it matters

The loader gave pyRevit a faster, typed .NET core. The agent runtime makes that core safely programmable by AI coding agents — one ships to every pyRevit user, the other ships opt-in with guardrails instead of trusting the model.

## Wider contribution

- ~1,092 commits, 100 PRs and 86 reviews in `pyrevitlabs/pyRevit` as of November 2026.
- Also authored the interactive Python Shell ([#3480](https://github.com/pyrevitlabs/pyRevit/pull/3480)), dark-mode theming, startup performance work ([#3580](https://github.com/pyrevitlabs/pyRevit/pull/3580)), the pre-2021 cleanup ([#3585](https://github.com/pyrevitlabs/pyRevit/pull/3585)) and signed-build integration tests ([#3721](https://github.com/pyrevitlabs/pyRevit/pull/3721)).

## Links

- [pyRevit 7.0 release](https://github.com/pyrevitlabs/pyRevit/releases/tag/v7.0.0.26278%2B2233)
- [Agent Runtime docs](https://docs.pyrevitlabs.io/agent-runtime/)
- [pyRevit GitHub](https://github.com/pyrevitlabs/pyRevit)
