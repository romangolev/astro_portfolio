---
title: "Automating .NET Builds with Nuke and Azure Pipelines"
date: 2024-11-01
description: "How Nuke.Build and Azure DevOps can automate .NET builds and delivery"
tags: ["CI/CD", "Azure", ".NET", "DevOps", "automation"]
draft: false
---

## The Problem

Manual builds and deployments are error-prone and time-consuming. When working on a multi-version Revit application, we needed to:

- Build for multiple Revit versions (2020-2025)
- Run tests across all configurations
- Package installers with proper versioning
- Package installers for distribution

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

- More consistent build and deployment steps
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
