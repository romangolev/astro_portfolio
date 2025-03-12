---
title: "pyArchitect extension"
description: "Extension for BIM coordination and architectural design"
repo: "romangolev/pyArchitect" # delete this line if you want a blog-like page
tags: ["BIM", "Revit", "pyRevit", "architecture", "design", "Python"]
weight: 1
draft: false
date: 2023-01-15
technologies: ["python", "pyRevit", "RevitAPI"]
---


The [pyRevit](https://github.com/pyrevitlabs/pyRevit) extension is an application on top of Autodesk Revit that gives the ability to create extensions using Python scripts without the need to compile code. pyRevit manages extensions written in Python and allows to run code on-the-go. 

This extension for pyRevit is an essence of Python Scripts developed primarily for Dynamo to extend the functionality of Autodesk Revit. There are scripts that automate routines tasks for architects, interior designers and BIM coordinators. 

The pyArchitect extension is available under GPL-3.0 license on Github [here](https://github.com/romangolev/pyArchitect)

Main extension itself looks the following way:

Extension has several panels in the tab:

* Main — control panel, information about the extension
* Coordination — tools for model coordination
* Finishing — bundle for achetecture interior works
* Tools — miscellaneous tools

Every tool has an embedded description. To see the description and hint, hover mouse over the button.
