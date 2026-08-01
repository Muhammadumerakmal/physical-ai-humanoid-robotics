# Book Structure

**Physical AI and Humanoid Robotics: Building Intelligent Machines**

> Working outline for the complete book. This document is the single source of
> truth for the table of contents. Each chapter maps 1:1 to a Docusaurus file
> under `docs/`, so the live sidebar is generated straight from this structure.

**Audience:** beginner AI engineers, software developers entering robotics, and
students. Assumes basic programming; no prior robotics or deep ML required.

---

## How this maps to Docusaurus

| Book concept        | Docusaurus construct                                  |
| ------------------- | ----------------------------------------------------- |
| Part                | Category in `sidebars.ts` + folder `docs/partN-slug/` |
| Chapter             | File `docs/partN-slug/NN-slug.mdx`                    |
| Sidebar order       | `sidebar_position` frontmatter / filename prefix      |
| Subsection          | `## Heading` inside the chapter (in-page TOC)         |
| Learning objectives | `## Learning Objectives` section at the top of chapter|

Every chapter file uses the same frontmatter convention as the current site:

```mdx
---
sidebar_position: N
description: One-sentence description for search and card previews.
---
```

Each chapter opens with **Learning Objectives** (`## Learning Objectives`), then
the **body subsections** (`## ...`), then **Exercises** (`## Exercises`).

Sidebar labels (in `sidebars.ts`): a short, consistent form of the part title,
e.g. `Part I · Foundations`. Folders use kebab-case slugs.

---

## At a glance

| Part | Title                          | Folder                 | Chapters |
| ---- | ------------------------------ | ---------------------- | -------- |
| I    | Foundations of Physical AI     | `part1-foundations`    | 4        |
| II   | Sensing & Perception           | `part2-sensing`        | 4        |
| III  | Actuation & Control            | `part3-control`        | 4        |
| IV   | Learning & Intelligence        | `part4-learning`       | 6        |
| V    | Systems, Simulation & Deploy.  | `part5-systems`        | 5        |
| VI   | The Road Ahead                 | `part6-future`         | 1        |
| —    | Appendices                     | `appendices`           | 4        |

**24 chapters + 4 appendices.** Every required topic is a dedicated chapter
(see [Coverage matrix](#required-topic-coverage-matrix)).

---

## Part I · Foundations of Physical AI

> Folder `docs/part1-foundations/`. Establishes what physical AI is, the
> robotics foundations it builds on, the math toolkit, and the humanoid
> platform that carries the rest of the book.

### Chapter 1 — What Is Physical AI? — `01-what-is-physical-ai.mdx`

**Learning Objectives.** After this chapter you will be able to:
- Define physical AI and distinguish it from conventional (digital) AI.
- Explain why embodiment imposes new constraints: contact, energy, latency, safety.
- Situate humanoids on the spectrum of physical AI systems.
- Identify the historical threads — control theory, machine learning, simulation —
  that converge in today's humanoids.

**Subsections.**
- Defining physical AI: perception, cognition, action in a body
- Embodied vs. digital intelligence
- Why embodiment changes everything
- The physical AI spectrum: from industrial arms to humanoids
- The hard problems digital AI never faces
- A brief history and the current convergence
- What this book builds, and how

### Chapter 2 — Robotics Foundations — `02-robotics-foundations.mdx`

**Learning Objectives.** After this chapter you will be able to:
- Define a robot and enumerate its core subsystems.
- Explain degrees of freedom and configuration space.
- Distinguish forward from inverse kinematics at a conceptual level.
- Describe the sense–plan–act loop that frames the rest of the book.

**Subsections.**
- What is a robot?
- Degrees of freedom and configuration space
- Joints, links, and end-effectors
- Forward and inverse kinematics (conceptual)
- Workspace, redundancy, and task space
- The sense–plan–act loop
- A taxonomy of robot systems (mobile, manipulation, legged, humanoid)

### Chapter 3 — The Math Toolkit for Embodied Machines — `03-math-toolkit.mdx`

**Learning Objectives.** After this chapter you will be able to:
- Perform vector and matrix operations and represent rotations in 2D and 3D.
- Use homogeneous transforms to move between coordinate frames.
- Explain gradient descent as the workhorse of robot learning.
- Apply basic probability to model noisy sensor measurements.

**Subsections.**
- Linear algebra: vectors, matrices, rotations
- Rigid-body transforms and homogeneous matrices
- Calculus essentials: derivatives, gradients, integrals
- Optimization basics: gradient descent and least squares
- Probability and statistics for uncertain sensors
- Why probabilistic thinking matters in robotics
- Practice problems

### Chapter 4 — Humanoid Robot Architecture — `04-humanoid-architecture.mdx`

**Learning Objectives.** After this chapter you will be able to:
- Map the anatomy of a humanoid to its degrees of freedom.
- Explain actuator and sensor placement choices (shoulder vs. knee, IMU vs. camera).
- Read a humanoid spec sheet: DoF, payload, battery, compute.
- Compare current reference platforms and their trade-offs.

**Subsections.**
- Degrees of freedom of a modern humanoid
- Mechanical layout: torso, arms, legs, hands, neck
- Actuator placement: what goes in the shoulder vs. the knee, and why
- Sensor placement: IMUs, encoders, cameras, force–torque
- Onboard compute, power, and thermal budgets
- Reference platforms compared
- Design tension: weight, strength, autonomy

---

## Part II · Sensing & Perception

> Folder `docs/part2-sensing/`. The body's nervous system: the sensor and
> actuator hardware, and turning raw signals into understanding of the world
> and self.

### Chapter 5 — Sensors and Actuators — `01-sensors-and-actuators.mdx`

**Learning Objectives.** After this chapter you will be able to:
- Classify sensors as proprioceptive (self) vs. exteroceptive (world).
- Explain how encoders, IMUs, and force–torque sensors work.
- Compare actuator technologies — servo, BLDC, series-elastic, hydraulic — for
  different joints.
- Read a datasheet and pick sensors/actuators for a simple robot task.

**Subsections.**
- The sensor–actuator contract
- Proprioceptive sensors: encoders, IMUs, force–torque
- Exteroceptive sensors: cameras, LiDAR, depth, microphones
- Actuator types: servo, BLDC, series-elastic, hydraulic, pneumatic
- Gearboxes, transmission, and backlash
- Reading datasheets and choosing components
- Blending signals: a first look at sensor fusion

### Chapter 6 — Robot Perception: From Signals to Understanding — `02-robot-perception.mdx`

**Learning Objectives.** After this chapter you will be able to:
- Describe the perception pipeline and its stages.
- Explain why calibration and coordinate frames matter.
- Distinguish perception for control from perception for planning.
- Identify where filtering enters noisy robot perception.

**Subsections.**
- What is robot perception?
- The pipeline: data → features → state → world model
- Coordinate frames and calibration
- Sensor fusion and filtering basics
- Scene understanding: objects, terrain, people
- Perception for action vs. perception for model-building

### Chapter 7 — Computer Vision — `03-computer-vision.mdx`

**Learning Objectives.** After this chapter you will be able to:
- Explain how a camera maps the 3D world into images.
- Distinguish classical features from learned representations.
- Apply object detection and segmentation to a robot perception task.
- Explain how depth estimation feeds planning and control.

**Subsections.**
- Cameras: how robots see
- Image formation, camera models, and calibration
- Classical features: edges, corners, descriptors
- Deep-learning vision: CNNs and backbone models
- Object detection and segmentation
- Depth and 3D understanding: stereo and depth sensors
- Visual odometry and vision for locomotion
- Evaluating vision models for robot use

### Chapter 8 — State Estimation and Localization — `04-state-estimation.mdx`

**Learning Objectives.** After this chapter you will be able to:
- Define the state-estimation problem for a robot.
- Explain the Kalman filter's predict–update cycle conceptually.
- Describe how a humanoid estimates its own body state.
- Compare odometry, filtering, and SLAM approaches and their trade-offs.

**Subsections.**
- The state-estimation problem
- Odometry: wheel, leg, visual
- The Kalman filter, intuitively
- Extended and unscented Kalman filters
- Probabilistic localization and SLAM
- Legged state estimation on humanoids
- Practical filtering in ROS 2

---

## Part III · Actuation & Control

> Folder `docs/part3-control/`. Making the body move reliably: the physics of
> the body, the control loops, balance and walking, and manipulation.

### Chapter 9 — Kinematics and Dynamics — `01-kinematics-dynamics.mdx`

**Learning Objectives.** After this chapter you will be able to:
- Compute forward kinematics for a simple chain.
- Explain the role of the Jacobian in mapping velocities and forces.
- Describe why humanoids are floating-base systems.
- Explain center-of-mass and contact constraints for balance.

**Subsections.**
- Kinematics for humanoids (review and extension)
- Rigid-body dynamics and the equations of motion
- The Jacobian: velocities and forces
- Floating-base dynamics for bipeds
- Contact: friction, stability, and the center of mass
- Software: MuJoCo, Pinocchio, and friends

### Chapter 10 — Motion Control — `02-motion-control.mdx`

**Learning Objectives.** After this chapter you will be able to:
- Explain the feedback control loop and the PID terms.
- Contrast position, velocity, and torque control.
- Explain impedance control and why compliance matters on humanoids.
- Tune a PID controller for a simple motor.

**Subsections.**
- Control systems 101: the feedback loop
- PID control in practice
- Feedforward and torque control
- Impedance and admittance control
- Operational-space control
- Tuning controllers on real robots

### Chapter 11 — Balance and Locomotion — `03-balance-locomotion.mdx`

**Learning Objectives.** After this chapter you will be able to:
- Explain walking through the inverted-pendulum model.
- Define ZMP and its role in balance.
- Contrast ZMP (quasi-static) and dynamic gaits.
- Describe how reinforcement learning generates locomotion policies that
  transfer to hardware.

**Subsections.**
- Why walking is hard: the inverted pendulum
- Center of mass, center of pressure, and ZMP
- Zero-moment-point walking
- Model predictive control for gaits
- Dynamic and running gaits
- Learning-based locomotion policies
- Sim-to-real for walking

### Chapter 12 — Manipulation and Grasping — `04-manipulation.mdx`

**Learning Objectives.** After this chapter you will be able to:
- Define the manipulation problem and a grasp taxonomy.
- Explain force-closure and why it matters for stable grasps.
- Compare scripted, model-based, and learned grasping.
- Describe whole-body vs. arm-only manipulation.

**Subsections.**
- The manipulation problem
- Grasp types and hand anatomy
- Force-closure and grasp synthesis
- Trajectory generation and pick-and-place
- Whole-body manipulation
- Learning-based grasping

---

## Part IV · Learning & Intelligence

> Folder `docs/part4-learning/`. Teaching the robot: from machine-learning
> foundations, through reinforcement and imitation learning, to VLA models,
> LLMs, and the agent architectures that tie it together.

### Chapter 13 — Machine Learning for Robots — `01-ml-for-robots.mdx`

**Learning Objectives.** After this chapter you will be able to:
- Explain how robot ML differs from digital ML (data, feedback, embodiment).
- Choose an architecture for a perception or action task.
- Curate and label robotic datasets responsibly.
- Evaluate models with the sim-to-real gap in mind.

**Subsections.**
- How ML meets robotics (and where it differs from digital ML)
- Supervised learning: data, labels, models
- Key architectures: MLPs, CNNs, transformers
- From perception models to action models
- Datasets and real-world data curation
- Evaluation and the sim-to-real gap
- Unsupervised and self-supervised methods

### Chapter 14 — Reinforcement Learning — `02-reinforcement-learning.mdx`

**Learning Objectives.** After this chapter you will be able to:
- Formalize a robot task as a Markov decision process.
- Compare value-based and policy-gradient RL.
- Explain why rewards are hard to design for robot tasks.
- Describe sim-to-real transfer and domain randomization.

**Subsections.**
- The RL problem: Markov decision processes
- Exploration vs. exploitation
- Value-based methods: Q-learning and DQN
- Policy gradients: PPO and SAC
- Reward design for robot tasks
- RL in simulation
- Sim-to-real transfer and domain randomization

### Chapter 15 — Imitation Learning — `03-imitation-learning.mdx`

**Learning Objectives.** After this chapter you will be able to:
- Explain behavior cloning and its failure modes.
- Compare behavior cloning, DAGGER, and offline RL.
- Describe diffusion policies at a high level.
- Design a data-collection pipeline for imitation learning.

**Subsections.**
- Learning from demonstration: why it matters
- Teleoperation and data collection
- Behavior cloning and its failure modes
- DAGGER and interactive imitation
- Diffusion policies and modern architectures
- Building a robot data pipeline

### Chapter 16 — Vision-Language-Action (VLA) Models — `04-vla-models.mdx`

**Learning Objectives.** After this chapter you will be able to:
- Explain how VLA models unify perception, language, and action.
- Describe the VLA training pipeline (pre-train, fine-tune, post-train).
- Identify inference challenges — latency and compute — on robot hardware.
- Evaluate a VLA on real manipulation tasks.

**Subsections.**
- From language models to embodied policies
- What is a VLA model?
- The training recipe: pre-training, fine-tuning, post-training
- Inference: latency and compute on the robot
- Robot transformer architectures
- Open-vocabulary manipulation
- Benchmarking and evaluating VLAs

### Chapter 17 — Large Language Models in Robotics — `05-llms-in-robotics.mdx`

**Learning Objectives.** After this chapter you will be able to:
- Enumerate the roles of LLMs in a robot stack (planning, reasoning, grounding).
- Describe how language is grounded in perception.
- Identify the risks of LLMs on physical systems and their mitigations.
- Build a simple LLM-based task planner with guardrails.

**Subsections.**
- What LLMs bring to robots
- LLMs as task planners
- From language to actions: grounding semantics in the world
- LLMs + perception: grounding language in vision
- Multimodal and vision-language models
- Hallucination, safety, and verification
- Prompting and structured outputs for robots

### Chapter 18 — AI Agents for Robot Control — `06-ai-agents.mdx`

**Learning Objectives.** After this chapter you will be able to:
- Define an AI agent in a robotics context.
- Explain ReAct-style reasoning–acting loops.
- Describe hierarchical agent architectures for long-horizon tasks.
- Discuss how agents monitor execution and recover from failures.

**Subsections.**
- What makes a robotic agent?
- Agent frameworks: ReAct, Reflexion, tool use
- Memory, context, and long-horizon tasks
- Hierarchical agents: planners over low-level policies
- Multi-agent and human–robot collaboration
- Execution monitoring and recovery
- From chatbots to embodied agents

---

## Part V · Systems, Simulation & Deployment

> Folder `docs/part5-systems/`. The software engineering of robots: ROS 2,
> the full software stack, simulation, NVIDIA Isaac Sim, and shipping to the
> real world.

### Chapter 19 — ROS 2: The Robot Operating System — `01-ros2.mdx`

**Learning Objectives.** After this chapter you will be able to:
- Explain the role of middleware in robotics.
- Create ROS 2 nodes that communicate over topics, services, and actions.
- Use TF2 to manage coordinate frames across the robot.
- Structure a multi-node robot software stack.

**Subsections.**
- Why robotics needs middleware
- Core concepts: nodes, topics, services, actions
- DDS underneath the hood
- Your first publisher/subscriber
- TF2 for coordinate transforms
- Launch files and lifecycle nodes
- Tooling: RViz, rosbag, and the CLI
- From tutorials to a robot stack

### Chapter 20 — Building the Robot Software Stack — `02-robot-software-stack.mdx`

**Learning Objectives.** After this chapter you will be able to:
- Sketch the layered software architecture of a humanoid.
- Explain real-time requirements and how they shape design.
- Use state machines and behavior trees for task-level control.
- Design a data pipeline for logging and debugging.

**Subsections.**
- Architecture of a humanoid's software
- The real-time stack: from drivers to policies
- Communication patterns and data flow
- State machines and behavior trees
- Logging, monitoring, and diagnostics
- Integrating perception, control, and learning

### Chapter 21 — Simulation for Physical AI — `03-simulation.mdx`

**Learning Objectives.** After this chapter you will be able to:
- Explain what a physics engine does and where it is inaccurate.
- Compare major simulators (MuJoCo, Bullet, PhysX, Gazebo) and their trade-offs.
- Set up a basic simulation of a robot.
- Describe sensor simulation and domain randomization.

**Subsections.**
- Why simulate: cost, safety, scale
- Physics engines: MuJoCo, Bullet, PhysX, and more
- Contact models, solver settings, and fidelity
- Simulating sensors and noise
- Sim-to-real transfer revisited
- Choosing a simulator

### Chapter 22 — NVIDIA Isaac Sim and Isaac Lab — `04-isaac-sim.mdx`

**Learning Objectives.** After this chapter you will be able to:
- Explain what Isaac Sim adds over classical simulators.
- Build and load a robot scene using USD.
- Use Isaac Lab to train an RL policy with massive parallelism.
- Describe the Isaac Sim → Isaac ROS → robot deployment path.

**Subsections.**
- Isaac Sim and the Omniverse platform
- USD: the universal scene description
- Building a robot scene
- Isaac Lab: RL training at scale
- GPU-accelerated physics and massive parallelism
- Synthetic data generation with Replicator
- Isaac ROS and the deployment bridge
- A worked training workflow

### Chapter 23 — Real-World Deployment — `05-deployment.mdx`

**Learning Objectives.** After this chapter you will be able to:
- Plan a deployment path from simulation to real hardware.
- Optimize models for on-robot compute (quantization, TensorRT).
- Design for safety and fault tolerance.
- Apply a validation checklist before fielding a robot.

**Subsections.**
- From simulation to silicon: the deployment path
- Edge compute and model optimization
- Latency budgets and real-time guarantees
- Safety: design, redundancy, and standards
- Testing, validation, and regression
- Field evaluation and continuous improvement
- Regulatory and ethical deployment
- A deployment checklist

---

## Part VI · The Road Ahead

> Folder `docs/part6-future/`. Where the field is going and the open problems
> that define it.

### Chapter 24 — The Future of Humanoid Robotics — `01-future-of-humanoids.mdx`

**Learning Objectives.** After this chapter you will be able to:
- Summarize the state of the art and its key open problems.
- Evaluate the economic and social case for humanoids.
- Discuss safety, governance, and ethics of deployed humanoids.
- Identify concrete paths for continuing your learning and building.

**Subsections.**
- The state of the art
- Open problems: dexterity, power, autonomy
- The economics of humanoids
- Humanoids in the world: homes, factories, society
- Safety, governance, and ethics
- Toward general embodied intelligence
- Your path into physical AI

---

## Appendices

> Folder `docs/appendices/`. Reference material, not part of the reading path.

- **A · Glossary** — `a-glossary.mdx`
  Terms: actuator, configuration space, DoF, ZMP, VLA, sim-to-real, domain
  randomization, policy, end-effector, floating base, and more.
- **B · Further Reading and Resources** — `b-resources.mdx`
  Papers, books, datasets, simulators, hardware, and communities.
- **C · Environment Setup** — `c-environment-setup.mdx`
  Installing Python, ROS 2, MuJoCo, Isaac Sim; verification checklist.
- **D · Math Quick Reference** — `d-math-reference.mdx`
  One-page cheatsheet for the transforms, gradients, and distributions used
  throughout the book.

---

## Required-topic coverage matrix

| Required topic                | Covered in                          |
| ----------------------------- | ----------------------------------- |
| Physical AI fundamentals      | Ch. 1, Part I                       |
| Robotics foundations          | Ch. 2                               |
| Sensors and actuators         | Ch. 5                               |
| Robot perception              | Ch. 6, 8                            |
| Computer vision               | Ch. 7                               |
| Machine learning for robots   | Ch. 13                              |
| Reinforcement learning        | Ch. 14                              |
| Large Language Models         | Ch. 17                              |
| AI agents controlling robots  | Ch. 18                              |
| Humanoid robot architecture   | Ch. 4, plus Ch. 9, 11 throughout    |
| ROS 2                         | Ch. 19                              |
| Simulation                    | Ch. 21 (and Ch. 14, 22 in depth)    |
| NVIDIA Isaac Sim              | Ch. 22                              |
| Real-world deployment         | Ch. 23                              |
| Future of humanoid robotics   | Ch. 24                              |

---

## Suggested reading paths

- **Straight through (recommended):** Parts I → II → III → IV → V → VI.
- **Builder / hands-on first:** Part V (Ch. 19–22) alongside Part I; come back
  to Parts II–IV as questions arise.
- **Software engineers, fast entry:** Part I → Ch. 13–18 (learning) → Ch. 19–23
  (systems) → skim II and III.
- **Researchers:** Parts IV and VI first, then fill in II and III.
