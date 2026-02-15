import type { ContentTemplate } from "@/types/content-management"

export const CONTENT_TEMPLATES: ContentTemplate[] = [
  {
    id: "project-deep-dive",
    label: "Project Deep Dive",
    defaultCategory: "Engineering",
    defaultTags: ["project", "architecture"],
    markdown: `## Problem

Define the core product or technical problem.

## Approach

Describe architecture, tools, and major tradeoffs.

## Implementation

Document key code paths and delivery milestones.

## Results

Share measurable outcomes and lessons learned.`,
  },
  {
    id: "career-reflection",
    label: "Career Reflection",
    defaultCategory: "Career",
    defaultTags: ["career", "growth"],
    markdown: `## Context

Set the timeline and challenge.

## What Changed

Explain what you changed and why.

## What Worked

Highlight concrete examples.

## Next Iteration

Capture follow-up actions.`,
  },
  {
    id: "tutorial",
    label: "Tutorial",
    defaultCategory: "How-To",
    defaultTags: ["tutorial", "guide"],
    markdown: `## Goal

What this tutorial helps the reader accomplish.

## Prerequisites

List assumptions and dependencies.

## Steps

1. Step one
2. Step two
3. Step three

## Validation

How to verify it works.`,
  },
]
