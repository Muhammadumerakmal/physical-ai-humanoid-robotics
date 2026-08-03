/**
 * Single source of truth for the book's glossary.
 *
 * Consumed by:
 *  - src/pages/glossary.tsx      (the searchable /glossary page)
 *  - src/components/GlossaryList (renders the list, reused by the appendix)
 *  - src/components/Term         (inline hover tooltips: <Term>ZMP</Term>)
 *
 * Keep terms alphabetized within their category. `aka` lists alternate spellings
 * or acronyms so inline <Term> lookups resolve (e.g. "IK" -> Inverse Kinematics).
 */

export type GlossaryCategory =
  | 'Foundations'
  | 'Sensing & Perception'
  | 'Actuation & Control'
  | 'Learning & Intelligence'
  | 'Systems & Deployment';

export type GlossaryEntry = {
  term: string;
  definition: string;
  category: GlossaryCategory;
  /** Acronyms / alternate forms that should resolve to this entry. */
  aka?: string[];
};

export const GLOSSARY: GlossaryEntry[] = [
  // ---------------- Foundations ----------------
  {
    term: 'Physical AI',
    category: 'Foundations',
    definition:
      'Artificial intelligence that senses, decides, and acts in the physical world through a body, subject to physics — gravity, friction, contact, and energy.',
    aka: ['Embodied AI'],
  },
  {
    term: 'Digital AI',
    category: 'Foundations',
    definition:
      'AI that operates only on symbols, pixels, and tokens with no body — a chatbot or image generator whose worst failure is a retry.',
  },
  {
    term: 'Embodiment',
    category: 'Foundations',
    definition:
      'Being present in a physical body subject to physics, so that intelligence must contend with contact, energy, latency, and safety.',
  },
  {
    term: 'Perception–Action Loop',
    category: 'Foundations',
    definition:
      'The continuous cycle of sense → decide → act → sense again that every embodied system must close in real time.',
    aka: ['Sense-Plan-Act', 'Perception Action Loop'],
  },
  {
    term: 'Humanoid',
    category: 'Foundations',
    definition:
      'A robot shaped roughly like a person — typically two arms, two legs, and a bipedal stance — chosen for generality across human environments.',
  },
  {
    term: 'Degrees of Freedom',
    category: 'Foundations',
    definition:
      'The number of independent parameters (usually joints) that define a robot’s configuration. A human arm has about seven.',
    aka: ['DoF', 'DOF'],
  },
  {
    term: 'Sim-to-Real',
    category: 'Foundations',
    definition:
      'Training a model in simulation and transferring the learned behavior onto real hardware, bridging the reality gap.',
    aka: ['Sim2Real'],
  },
  {
    term: 'Reality Gap',
    category: 'Foundations',
    definition:
      'The mismatch between simulated physics/sensors and the real world that causes behaviors learned in sim to fail on hardware.',
  },
  {
    term: 'End Effector',
    category: 'Foundations',
    definition:
      'The device at the end of a robotic arm that interacts with the world — a gripper, hand, or tool.',
  },
  {
    term: 'Payload',
    category: 'Foundations',
    definition:
      'The maximum weight a robot or manipulator can carry or exert force on while still operating within spec.',
  },
  {
    term: 'Workspace',
    category: 'Foundations',
    definition:
      'The full set of positions and orientations a robot’s end effector can reach.',
  },

  // ---------------- Sensing & Perception ----------------
  {
    term: 'Sensor',
    category: 'Sensing & Perception',
    definition:
      'A device that converts a physical quantity (light, distance, force, rotation) into a signal the robot can process.',
  },
  {
    term: 'Actuator',
    category: 'Sensing & Perception',
    definition:
      'A device that converts control signals into physical motion or force — electric motors, hydraulics, or pneumatics.',
  },
  {
    term: 'Inertial Measurement Unit',
    category: 'Sensing & Perception',
    definition:
      'A sensor combining accelerometers and gyroscopes (sometimes magnetometers) to estimate orientation, angular velocity, and acceleration.',
    aka: ['IMU'],
  },
  {
    term: 'LiDAR',
    category: 'Sensing & Perception',
    definition:
      'Light Detection and Ranging — a sensor that measures distance by timing reflected laser pulses, producing 3D point clouds.',
  },
  {
    term: 'Encoder',
    category: 'Sensing & Perception',
    definition:
      'A sensor that measures the angle or position of a joint or motor shaft, essential for closed-loop control.',
  },
  {
    term: 'Point Cloud',
    category: 'Sensing & Perception',
    definition:
      'A set of 3D points sampled from surfaces in a scene, typically produced by LiDAR or depth cameras.',
  },
  {
    term: 'Depth Camera',
    category: 'Sensing & Perception',
    definition:
      'A camera that estimates per-pixel distance to the scene, using stereo, structured light, or time-of-flight.',
    aka: ['RGB-D'],
  },
  {
    term: 'Proprioception',
    category: 'Sensing & Perception',
    definition:
      'A robot’s sense of its own body — joint angles, velocities, and forces — as opposed to sensing the external world.',
  },
  {
    term: 'Sensor Fusion',
    category: 'Sensing & Perception',
    definition:
      'Combining data from multiple sensors to produce an estimate more accurate and robust than any single sensor alone.',
  },
  {
    term: 'Computer Vision',
    category: 'Sensing & Perception',
    definition:
      'The field of extracting meaning — objects, poses, depth, motion — from images and video.',
  },
  {
    term: 'Object Detection',
    category: 'Sensing & Perception',
    definition:
      'Locating and classifying objects within an image, usually as bounding boxes with labels.',
  },
  {
    term: 'Semantic Segmentation',
    category: 'Sensing & Perception',
    definition:
      'Labeling every pixel in an image with the class of object it belongs to.',
  },
  {
    term: 'State Estimation',
    category: 'Sensing & Perception',
    definition:
      'Inferring a robot’s hidden state (pose, velocity) from noisy sensor measurements over time.',
  },
  {
    term: 'Kalman Filter',
    category: 'Sensing & Perception',
    definition:
      'A recursive estimator that fuses predictions and noisy measurements to track a system’s state optimally under linear-Gaussian assumptions.',
  },
  {
    term: 'SLAM',
    category: 'Sensing & Perception',
    definition:
      'Simultaneous Localization and Mapping — building a map of an unknown environment while tracking the robot’s pose within it.',
  },
  {
    term: 'Localization',
    category: 'Sensing & Perception',
    definition:
      'Determining a robot’s position and orientation within a known map or frame of reference.',
  },
  {
    term: 'Odometry',
    category: 'Sensing & Perception',
    definition:
      'Estimating change in position over time from motion sensors (wheel encoders, IMU, or camera), which accumulates drift.',
  },

  // ---------------- Actuation & Control ----------------
  {
    term: 'Kinematics',
    category: 'Actuation & Control',
    definition:
      'The study of motion — positions, velocities, accelerations — without regard to the forces that cause it.',
  },
  {
    term: 'Dynamics',
    category: 'Actuation & Control',
    definition:
      'The study of motion together with the forces and torques that produce it.',
  },
  {
    term: 'Forward Kinematics',
    category: 'Actuation & Control',
    definition:
      'Computing the end-effector pose from known joint angles.',
    aka: ['FK'],
  },
  {
    term: 'Inverse Kinematics',
    category: 'Actuation & Control',
    definition:
      'Computing the joint angles required to place the end effector at a desired pose — often with multiple or no solutions.',
    aka: ['IK'],
  },
  {
    term: 'Degree of Actuation',
    category: 'Actuation & Control',
    definition:
      'The number of independently driven joints; an underactuated system has fewer actuators than degrees of freedom.',
  },
  {
    term: 'PID Control',
    category: 'Actuation & Control',
    definition:
      'A feedback controller that drives error to zero using proportional, integral, and derivative terms.',
  },
  {
    term: 'Feedback Control',
    category: 'Actuation & Control',
    definition:
      'Continuously adjusting actuator commands based on measured error between desired and actual state.',
    aka: ['Closed-Loop Control'],
  },
  {
    term: 'Model Predictive Control',
    category: 'Actuation & Control',
    definition:
      'A control method that optimizes actions over a receding time horizon using a model of the system dynamics.',
    aka: ['MPC'],
  },
  {
    term: 'Trajectory',
    category: 'Actuation & Control',
    definition:
      'A time-parameterized path — the sequence of positions (and often velocities) a joint or body follows.',
  },
  {
    term: 'Torque',
    category: 'Actuation & Control',
    definition:
      'Rotational force applied at a joint; the fundamental control variable for many robot actuators.',
  },
  {
    term: 'Zero Moment Point',
    category: 'Actuation & Control',
    definition:
      'The point on the ground where the net moment of inertial and gravity forces has no horizontal component — a classic criterion for bipedal balance.',
    aka: ['ZMP'],
  },
  {
    term: 'Center of Mass',
    category: 'Actuation & Control',
    definition:
      'The average position of a body’s mass; keeping its projection within the support polygon is key to static balance.',
    aka: ['CoM', 'COM'],
  },
  {
    term: 'Gait',
    category: 'Actuation & Control',
    definition:
      'The pattern of limb movement during locomotion — e.g. a walking or running gait for a biped.',
  },
  {
    term: 'Locomotion',
    category: 'Actuation & Control',
    definition:
      'The act of moving the whole body through the environment — walking, running, climbing.',
  },
  {
    term: 'Manipulation',
    category: 'Actuation & Control',
    definition:
      'Using arms, hands, or grippers to grasp, move, and act on objects in the world.',
  },
  {
    term: 'Grasping',
    category: 'Actuation & Control',
    definition:
      'Securing an object with an end effector so it can be lifted or manipulated without slipping.',
  },
  {
    term: 'Compliance',
    category: 'Actuation & Control',
    definition:
      'A robot’s ability to yield to external forces rather than rigidly resisting them, enabling safe contact.',
  },

  // ---------------- Learning & Intelligence ----------------
  {
    term: 'Machine Learning',
    category: 'Learning & Intelligence',
    definition:
      'Building systems that improve at a task by learning patterns from data rather than being explicitly programmed.',
    aka: ['ML'],
  },
  {
    term: 'Neural Network',
    category: 'Learning & Intelligence',
    definition:
      'A model of interconnected layers of weighted units that learns to map inputs to outputs by adjusting weights.',
  },
  {
    term: 'Reinforcement Learning',
    category: 'Learning & Intelligence',
    definition:
      'Learning a policy by trial and error, maximizing cumulative reward from interaction with an environment.',
    aka: ['RL'],
  },
  {
    term: 'Policy',
    category: 'Learning & Intelligence',
    definition:
      'A mapping from observed state to action; the object a learning agent is trying to optimize.',
  },
  {
    term: 'Reward Function',
    category: 'Learning & Intelligence',
    definition:
      'The signal that defines what an RL agent should achieve; shaping it well is central to successful training.',
  },
  {
    term: 'Imitation Learning',
    category: 'Learning & Intelligence',
    definition:
      'Learning a policy from expert demonstrations rather than from a hand-designed reward.',
    aka: ['Learning from Demonstration', 'LfD'],
  },
  {
    term: 'Behavioral Cloning',
    category: 'Learning & Intelligence',
    definition:
      'The simplest form of imitation learning: supervised learning of the mapping from observed states to demonstrated actions.',
  },
  {
    term: 'Teleoperation',
    category: 'Learning & Intelligence',
    definition:
      'A human remotely controlling a robot in real time — a common way to collect demonstration data.',
  },
  {
    term: 'Vision-Language-Action Model',
    category: 'Learning & Intelligence',
    definition:
      'A neural network that maps camera images and language instructions directly to robot actions.',
    aka: ['VLA'],
  },
  {
    term: 'Foundation Model',
    category: 'Learning & Intelligence',
    definition:
      'A large model pretrained on broad data that can be adapted to many downstream tasks — increasingly used as a robot’s “brain.”',
  },
  {
    term: 'Large Language Model',
    category: 'Learning & Intelligence',
    definition:
      'A foundation model trained on text that can reason, plan, and generate language — used in robotics for high-level planning.',
    aka: ['LLM'],
  },
  {
    term: 'Domain Randomization',
    category: 'Learning & Intelligence',
    definition:
      'Randomizing simulation parameters (textures, physics, lighting) during training so a policy generalizes to the real world.',
  },
  {
    term: 'AI Agent',
    category: 'Learning & Intelligence',
    definition:
      'A system that perceives, plans, and acts toward goals over time, often orchestrating tools, memory, and sub-skills.',
  },

  // ---------------- Systems & Deployment ----------------
  {
    term: 'ROS 2',
    category: 'Systems & Deployment',
    definition:
      'Robot Operating System 2 — a middleware framework providing communication, tooling, and packages for building robot software.',
    aka: ['ROS2', 'ROS'],
  },
  {
    term: 'Node',
    category: 'Systems & Deployment',
    definition:
      'In ROS 2, an independent process that performs computation and communicates with other nodes via topics, services, or actions.',
  },
  {
    term: 'Topic',
    category: 'Systems & Deployment',
    definition:
      'A named channel in ROS 2 over which nodes publish and subscribe to streams of messages.',
  },
  {
    term: 'Middleware',
    category: 'Systems & Deployment',
    definition:
      'Software that sits between the operating system and applications, handling communication and coordination between robot components.',
  },
  {
    term: 'Digital Twin',
    category: 'Systems & Deployment',
    definition:
      'A high-fidelity virtual replica of a physical robot or environment used for simulation, testing, and monitoring.',
  },
  {
    term: 'Simulation',
    category: 'Systems & Deployment',
    definition:
      'Running a robot in a physics-based virtual environment to develop, train, and test behaviors before real deployment.',
  },
  {
    term: 'MuJoCo',
    category: 'Systems & Deployment',
    definition:
      'A fast physics engine (Multi-Joint dynamics with Contact) widely used for robot learning and control research.',
  },
  {
    term: 'Isaac Sim',
    category: 'Systems & Deployment',
    definition:
      'NVIDIA’s GPU-accelerated robotics simulator built on Omniverse, used for photorealistic sim and synthetic data.',
  },
  {
    term: 'Isaac Lab',
    category: 'Systems & Deployment',
    definition:
      'NVIDIA’s framework on top of Isaac Sim for large-scale reinforcement and imitation learning of robot policies.',
  },
  {
    term: 'Real-Time',
    category: 'Systems & Deployment',
    definition:
      'A guarantee that computations complete within strict deadlines — essential for control loops that keep a robot balanced.',
  },
  {
    term: 'Edge Computing',
    category: 'Systems & Deployment',
    definition:
      'Running computation on or near the robot itself rather than in the cloud, to meet latency and reliability needs.',
  },
  {
    term: 'Latency',
    category: 'Systems & Deployment',
    definition:
      'The delay between sensing and acting; high latency can destabilize fast control loops.',
  },
  {
    term: 'Safety Envelope',
    category: 'Systems & Deployment',
    definition:
      'The bounded region of states and actions within which a robot is certified to operate safely.',
  },
];

/** Normalize a term or acronym for lookup. */
function normalize(s: string): string {
  return s.trim().toLowerCase();
}

const LOOKUP: Map<string, GlossaryEntry> = (() => {
  const m = new Map<string, GlossaryEntry>();
  for (const entry of GLOSSARY) {
    m.set(normalize(entry.term), entry);
    for (const alias of entry.aka ?? []) m.set(normalize(alias), entry);
  }
  return m;
})();

/** Look up a glossary entry by term or acronym (case-insensitive). */
export function findEntry(term: string): GlossaryEntry | undefined {
  return LOOKUP.get(normalize(term));
}

export const CATEGORIES: GlossaryCategory[] = [
  'Foundations',
  'Sensing & Perception',
  'Actuation & Control',
  'Learning & Intelligence',
  'Systems & Deployment',
];
