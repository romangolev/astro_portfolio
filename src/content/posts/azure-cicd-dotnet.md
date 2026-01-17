---
title: "Automating .NET Builds with Nuke and Azure Pipelines"
date: 2024-11-01
description: "How setting up CI/CD pipelines with Nuke.Build and Azure DevOps cut deployment time by 40%"
tags: ["CI/CD", "Azure", ".NET", "DevOps", "automation"]
draft: false
---

## The Problem

Manual builds and deployments are error-prone and time-consuming. When working on a multi-version Revit application, we needed to:

- Build for multiple Revit versions (2020-2025)
- Run tests across all configurations
- Package installers with proper versioning
- Deploy to internal distribution channels

Doing this manually took hours and was prone to mistakes.

## The Solution: Nuke.Build + Azure Pipelines

### Why Nuke.Build?

[Nuke](https://nuke.build/) is a build automation system for .NET that lets you define builds in C# instead of YAML or scripts. Benefits include:

- **Type-safe** - Build logic in C# with full IDE support
- **Cross-platform** - Works on Windows, Linux, macOS
- **Extensible** - Easy to add custom build steps
- **CI/CD agnostic** - Same build locally and in pipelines

### Pipeline Structure

```
Build Pipeline:
├── Restore dependencies
├── Build (all Revit versions in parallel)
├── Run unit tests
├── Run integration tests
├── Package with Inno Setup
├── Sign binaries
└── Publish artifacts
```

### Key Optimizations

1. **Parallel builds** - Each Revit version builds simultaneously
2. **Caching** - NuGet packages cached between runs
3. **Incremental builds** - Only rebuild changed components
4. **Artifact management** - Versioned installers stored automatically

## Results

- **40% reduction** in deployment time
- Zero manual build errors
- Consistent builds across team members
- Automatic version numbering and changelog generation

## Code Sample

```csharp
Target Compile => _ => _
    .DependsOn(Restore)
    .Executes(() =>
    {
        DotNetBuild(s => s
            .SetProjectFile(Solution)
            .SetConfiguration(Configuration)
            .EnableNoRestore());
    });
```

The full build definition lives in the repository, making it versionable and reviewable like any other code.
