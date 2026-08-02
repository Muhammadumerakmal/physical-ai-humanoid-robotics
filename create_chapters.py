import os

template = """---
sidebar_position: {position}
description: {desc}
---

# {title}

> **Status:** draft
>
> **Related chapters:** TBD

## Why This Matters

<One or two paragraphs. Motivate before you explain.>

## Learning Objectives

After this chapter you will be able to:

- <Objective 1.>

## Core Concepts

| Concept | Definition |
| ------- | ---------- |
| <Term> | <One-line definition.> |

## Technical Explanation

<Body of the chapter.>

## Real-World Examples

:::info Real system
<Real humanoid platform example.>
:::

## Architecture Diagrams

```mermaid
flowchart LR
    A[<Sense>] --> B[<Perceive>]
```

## Code Examples

```python
# Minimal example
```

## Summary

<Summary.>

## Exercises

1. **Easy** — <Task.>

## Further Reading

- <Link>
"""

chapters = [
    # Part 4
    ("docs/part4-learning", "01-ml-for-robots.mdx", 1, "ML for robotics.", "Machine Learning for Robots"),
    ("docs/part4-learning", "02-reinforcement-learning.mdx", 2, "RL for robotics.", "Reinforcement Learning"),
    ("docs/part4-learning", "03-imitation-learning.mdx", 3, "Imitation learning.", "Imitation Learning"),
    ("docs/part4-learning", "04-vla-models.mdx", 4, "VLA models.", "Vision-Language-Action Models"),
    ("docs/part4-learning", "05-llms-in-robotics.mdx", 5, "LLMs in robotics.", "LLMs in Robotics"),
    ("docs/part4-learning", "06-ai-agents.mdx", 6, "AI agents.", "AI Agents for Robot Control"),
    # Part 5
    ("docs/part5-systems", "01-ros2.mdx", 1, "Intro to ROS 2.", "ROS 2"),
    ("docs/part5-systems", "02-robot-software-stack.mdx", 2, "Robot software stack.", "Building the Robot Software Stack"),
    ("docs/part5-systems", "03-simulation.mdx", 3, "Robot simulation.", "Simulation for Physical AI"),
    ("docs/part5-systems", "04-isaac-sim.mdx", 4, "NVIDIA Isaac Sim.", "NVIDIA Isaac Sim and Isaac Lab"),
    ("docs/part5-systems", "05-deployment.mdx", 5, "Real-world deployment.", "Real-World Deployment"),
    # Part 6
    ("docs/part6-future", "01-future-of-humanoids.mdx", 1, "Future of humanoids.", "The Future of Humanoid Robotics")
]

for folder, filename, pos, desc, title in chapters:
    path = os.path.join(folder, filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(template.format(position=pos, desc=desc, title=title))
    print(f"Created {path}")
