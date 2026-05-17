---
title: "Building the New pyRevit C# Loader"
date: 2026-05-06
description: "A complete rewrite of the pyRevit loader in modern C#, bringing type safety, better memory management, and faster startup times across all Revit versions."
tags: ["pyRevit", "C#", "Revit", "BIM", "Open Source"]
draft: false
---

The original pyRevit loader was built in Python. While it worked, loading extensions into Revit had limitations in startup time, memory usage, and type safety. The pyRevit team decided to build a modern C# implementation — and I took on significant parts of this work.

## Key Improvements

**Faster Extension Loading**

Replaced Python-based loading with compiled C# code. Extensions now load faster with better memory management and assembly caching.

**Type-Safe Extension Configuration**

Moved from Python dictionaries to strongly-typed C# classes. Configuration errors are caught at compile time, not runtime.

**Unified Authorization System**

Implemented AuthorizedUsers/AuthorizedGroups matching the legacy Python implementation. Supports username and Windows security group (SID) based access control.

## Better UI Component Support

- SmartButtons now work correctly inside pulldown menus
- SplitButton current button properly rebinds after beta/version reloads
- Icon inheritance fixed across all ribbon components
- Tooltips show author and bundle name
- Context-aware icon sizing in dropdowns — small (16px), medium (24px), and large (32px) images render at the right size for pulldown, split-button, and combobox items

## Modern Build System

- BuildContext sharing across components
- Stopped DLL duplication into engine folders
- Optimized code analysis targets

## Combobox Enhancements

Rich, multi-select comboboxes: members can be grouped, carry their own icons, tooltips, and tooltip images, and respect `before`/`after` layout directives — all exposed through consistent API aliases.

## Impact

- 285 commits to the loader codebase
- ~850 files changed across pyRevitLoader
- 58,000+ lines added / 22,000+ removed
- ⚡ Faster startup, better type safety, consistent Revit 2021–2027 (automatic fallback to the legacy Python loader on older versions)

**Now the default loader for all pyRevit users.** The new loader powers thousands of BIM professional installations across Revit 2021–2027, with automatic fallback to the legacy loader on older versions.

## Performance: Loading-Time Benchmarks

Real-world pyRevit startup measurements (2025), comparing the new C# loader against the legacy pythonic loader at increasing extension counts (the `pyrevit.loader.sessionmgr` reported load time):

| Extensions loaded | New C# loader | Legacy Python loader | Speed gain |
|---|---|---|---|
| 5 | 22.17 s | 25.00 s | ~2.8 s faster (~11%) |
| 7 | 25.54 s | 26.02 s | ~0.5 s faster (~2%) |
| 9 | 26.77 s | 33.31 s | ~6.5 s faster (~20%) |

Raw `sessionmgr` log values — 5 extensions: 22.169921875 s vs 25.0004119873 s; 7 extensions: 25.5420761108 s vs 26.0150375366 s; 9 extensions: 26.7673263550 s vs 33.3064880371 s.

The advantage **scales with extension count**: the gap widens from ~11% at 5 extensions to ~20% (≈6.5 s) at 9 extensions — the C# loader stays consistently faster and degrades far more gracefully as installations grow.

## Technical Details

The rewrite brings:
- **Type safety** — Configuration errors caught at compile time
- **Memory management** — Better assembly caching
- **Consistent API** — Unified across versions
- **Faster startup** — Every Revit session now starts faster

Big thanks to the pyRevit team for trusting me with this major component. This represents thousands of hours of work across multiple contributors.
