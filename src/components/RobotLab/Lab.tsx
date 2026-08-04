import {useCallback, useEffect, useRef, useState} from 'react';
import {Canvas, useFrame} from '@react-three/fiber';
import {
  ContactShadows,
  MeshReflectorMaterial,
  OrbitControls,
  RoundedBox,
  SoftShadows,
} from '@react-three/drei';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import * as THREE from 'three';
import {
  EXAMPLE_COMMANDS,
  SKILL_BUTTONS,
  parseCommandLocal,
  sanitizePlan,
  type Plan,
  type PlanStep,
} from './skills';
import styles from './styles.module.css';

/* --------------------------- pose + state model ------------------------ */

type Channels = {
  headPitch: number;
  headYaw: number;
  torsoPitch: number;
  torsoRoll: number;
  lShP: number;
  lShR: number;
  lEl: number;
  rShP: number;
  rShR: number;
  rEl: number;
  lHip: number;
  lKnee: number;
  rHip: number;
  rKnee: number;
  rootY: number;
};

const NEUTRAL: Channels = {
  headPitch: 0,
  headYaw: 0,
  torsoPitch: 0,
  torsoRoll: 0,
  lShP: 0,
  lShR: -0.14,
  lEl: 0.1,
  rShP: 0,
  rShR: 0.14,
  rEl: 0.1,
  lHip: 0,
  lKnee: 0,
  rHip: 0,
  rKnee: 0,
  rootY: 0,
};

const CUBE_START = {x: 1.6, z: 0};

type Action = {
  name: string;
  t: number;
  dur: number;
  update: (dt: number) => boolean; // returns true when finished
  onEnd?: () => void;
};

type SimState = {
  cur: Channels;
  tgt: Channels;
  bx: number;
  bz: number;
  yaw: number;
  targetYaw: number;
  walkPhase: number;
  tilt: number;
  tiltVel: number;
  fallen: boolean;
  fallTimer: number;
  cube: {x: number; y: number; z: number; held: boolean};
  queue: Action[];
  current: Action | null;
  clock: number;
};

export type RobotStatus = {busy: boolean; action: string; held: boolean; fallen: boolean};

function freshState(): SimState {
  return {
    cur: {...NEUTRAL},
    tgt: {...NEUTRAL},
    bx: 0,
    bz: 0,
    yaw: 0,
    targetYaw: 0,
    walkPhase: 0,
    tilt: 0,
    tiltVel: 0,
    fallen: false,
    fallTimer: 0,
    cube: {x: CUBE_START.x, y: 0.18, z: CUBE_START.z, held: false},
    queue: [],
    current: null,
    clock: 0,
  };
}

/* ------------------------------ helpers -------------------------------- */

function damp(cur: number, target: number, lambda: number, dt: number) {
  return cur + (target - cur) * (1 - Math.exp(-lambda * dt));
}

function resetTransient(s: SimState) {
  const keep = new Set(['rootY']);
  (Object.keys(NEUTRAL) as (keyof Channels)[]).forEach((k) => {
    if (!keep.has(k as string)) s.tgt[k] = NEUTRAL[k];
  });
}

function goalFor(target: string | undefined, s: SimState): {x: number; z: number} {
  switch (target) {
    case 'cube': {
      // stop just short of the cube, along the line from the robot to it
      const dx = s.cube.x - s.bx;
      const dz = s.cube.z - s.bz;
      const d = Math.hypot(dx, dz) || 1;
      return {x: s.cube.x - (dx / d) * 0.55, z: s.cube.z - (dz / d) * 0.55};
    }
    case 'left':
      return {x: -1.4, z: 0};
    case 'right':
      return {x: 1.4, z: 0};
    case 'forward':
      return {x: 0, z: 1.4};
    case 'center':
    default:
      return {x: 0, z: 0};
  }
}

/**
 * Move the body toward (gx,gz) and animate a walk/run gait. The step cadence is
 * tied to distance actually travelled, so the feet track the ground instead of
 * sliding. Returns distance left.
 */
function stepToward(
  s: SimState,
  gx: number,
  gz: number,
  dt: number,
  speed = 1.15,
): number {
  const dx = gx - s.bx;
  const dz = gz - s.bz;
  const dist = Math.hypot(dx, dz);
  if (dist > 0.02) {
    s.targetYaw = Math.atan2(dx, dz);
  }
  const stepLen = speed * dt;
  let moved: number;
  if (dist > stepLen) {
    s.bx += (dx / dist) * stepLen;
    s.bz += (dz / dist) * stepLen;
    moved = stepLen;
  } else {
    moved = dist;
    s.bx = gx;
    s.bz = gz;
  }

  const running = speed > 1.6;
  // one half gait cycle per `stride` metres travelled → feet keep pace
  const stride = running ? 0.82 : 0.62;
  s.walkPhase += (moved / stride) * Math.PI;
  const sw = Math.sin(s.walkPhase);
  const amp = running ? 0.75 : 0.5;
  const lift = running ? 1.15 : 0.9;

  s.tgt.lHip = sw * amp;
  s.tgt.rHip = -sw * amp;
  // knees bend on the swing (back) phase so the swing foot clears the ground
  s.tgt.lKnee = Math.max(0, -sw) * lift;
  s.tgt.rKnee = Math.max(0, sw) * lift;
  // arms counter-swing the legs
  s.tgt.rShP = -sw * amp * 0.7;
  s.tgt.lShP = sw * amp * 0.7;
  // vertical bob once per step + a slight forward lean when running
  s.tgt.rootY = Math.abs(sw) * (running ? 0.06 : 0.04);
  s.tgt.torsoPitch = running ? 0.12 : 0.03;
  // weight shift: lean and glance toward the planted leg
  s.tgt.torsoRoll = sw * 0.05;
  s.tgt.headYaw = -sw * 0.04;
  return dist;
}

/* ---------------------------- action factory --------------------------- */

function buildAction(step: PlanStep, s: SimState): Action {
  const p = step.params ?? {};
  const start = () => resetTransient(s);

  switch (step.skill) {
    case 'wave':
      return {
        name: 'wave',
        t: 0,
        dur: 2.6,
        update(dt) {
          if (this.t === 0) start();
          this.t += dt;
          s.tgt.rShR = 2.3 + Math.sin(this.t * 8) * 0.25;
          s.tgt.rEl = 0.4;
          return this.t >= this.dur;
        },
        onEnd: () => resetTransient(s),
      };
    case 'wave_both':
      return {
        name: 'wave both',
        t: 0,
        dur: 2.8,
        update(dt) {
          if (this.t === 0) start();
          this.t += dt;
          const o = Math.sin(this.t * 8) * 0.25;
          s.tgt.rShR = 2.3 + o;
          s.tgt.lShR = -2.3 - o;
          s.tgt.rEl = 0.4;
          s.tgt.lEl = 0.4;
          return this.t >= this.dur;
        },
        onEnd: () => resetTransient(s),
      };
    case 'nod':
      return {
        name: 'nod',
        t: 0,
        dur: 2,
        update(dt) {
          if (this.t === 0) start();
          this.t += dt;
          s.tgt.headPitch = 0.24 + Math.sin(this.t * 6) * 0.24;
          return this.t >= this.dur;
        },
        onEnd: () => resetTransient(s),
      };
    case 'walk_to': {
      const g = goalFor(p.target, s);
      return {
        name: `walk to ${p.target ?? 'center'}`,
        t: 0,
        dur: 12,
        update(dt) {
          if (this.t === 0) start();
          this.t += dt;
          const dist = stepToward(s, g.x, g.z, dt);
          return dist < 0.05 || this.t >= this.dur;
        },
        onEnd: () => resetTransient(s),
      };
    }
    case 'turn': {
      const dir = p.direction === 'right' ? -1 : 1;
      let set = false;
      return {
        name: `turn ${p.direction ?? 'left'}`,
        t: 0,
        dur: 3,
        update(dt) {
          if (!set) {
            start();
            s.targetYaw = s.yaw + dir * (Math.PI / 2);
            set = true;
          }
          this.t += dt;
          return Math.abs(s.targetYaw - s.yaw) < 0.03 || this.t >= this.dur;
        },
      };
    }
    case 'point': {
      const t = p.target;
      return {
        name: `point ${t ?? 'forward'}`,
        t: 0,
        dur: 2.4,
        update(dt) {
          if (this.t === 0) {
            start();
            if (t === 'right') s.tgt.rShR = 1.6;
            else if (t === 'left') s.tgt.lShR = -1.6;
            else {
              s.tgt.rShP = -1.4; // arm forward
              s.tgt.rEl = 0.05;
            }
          }
          this.t += dt;
          return this.t >= this.dur;
        },
        onEnd: () => resetTransient(s),
      };
    }
    case 'pick_up': {
      const g = goalFor('cube', s);
      let phase = 0;
      let pt = 0;
      return {
        name: 'pick up cube',
        t: 0,
        dur: 16,
        update(dt) {
          if (this.t === 0) start();
          this.t += dt;
          if (phase === 0) {
            const dist = stepToward(s, g.x, g.z, dt);
            if (dist < 0.06) {
              phase = 1;
              pt = 0;
              resetTransient(s);
            }
          } else if (phase === 1) {
            // crouch and reach down
            pt += dt;
            s.tgt.rootY = -0.34;
            s.tgt.lHip = 1.0;
            s.tgt.rHip = 1.0;
            s.tgt.lKnee = -1.4;
            s.tgt.rKnee = -1.4;
            s.tgt.torsoPitch = 0.5;
            s.tgt.rShP = -1.1;
            s.tgt.lShP = -1.1;
            s.tgt.rEl = 0.3;
            s.tgt.lEl = 0.3;
            if (pt > 0.7) {
              s.cube.held = true;
              phase = 2;
              pt = 0;
            }
          } else {
            // stand back up holding the cube in front
            pt += dt;
            resetTransientKeepHold(s);
            if (pt > 0.7) return true;
          }
          return this.t >= this.dur;
        },
      };
    }
    case 'put_down': {
      let pt = 0;
      let dropped = false;
      return {
        name: 'put down',
        t: 0,
        dur: 2.2,
        update(dt) {
          if (this.t === 0) start();
          this.t += dt;
          pt += dt;
          s.tgt.rootY = -0.34;
          s.tgt.lHip = 1.0;
          s.tgt.rHip = 1.0;
          s.tgt.lKnee = -1.4;
          s.tgt.rKnee = -1.4;
          s.tgt.torsoPitch = 0.5;
          s.tgt.rShP = -1.1;
          s.tgt.lShP = -1.1;
          if (pt > 0.7 && !dropped) {
            // drop the cube on the ground in front of the robot
            const fx = Math.sin(s.yaw);
            const fz = Math.cos(s.yaw);
            s.cube.held = false;
            s.cube.x = s.bx + fx * 0.55;
            s.cube.z = s.bz + fz * 0.55;
            s.cube.y = 0.18;
            dropped = true;
          }
          if (pt > 1.4) {
            resetTransient(s);
            return pt > 2;
          }
          return false;
        },
        onEnd: () => resetTransient(s),
      };
    }
    case 'crouch':
      return {
        name: 'crouch',
        t: 0,
        dur: 1.8,
        update(dt) {
          if (this.t === 0) start();
          this.t += dt;
          const down = Math.sin(Math.min(this.t / this.dur, 1) * Math.PI);
          s.tgt.rootY = -0.36 * down;
          s.tgt.lHip = 1.0 * down;
          s.tgt.rHip = 1.0 * down;
          s.tgt.lKnee = -1.5 * down;
          s.tgt.rKnee = -1.5 * down;
          return this.t >= this.dur;
        },
        onEnd: () => resetTransient(s),
      };
    case 'sit':
      return {
        name: 'sit',
        t: 0,
        dur: 1.4,
        update(dt) {
          if (this.t === 0) start();
          this.t += dt;
          s.tgt.rootY = -0.5;
          s.tgt.lHip = 1.4;
          s.tgt.rHip = 1.4;
          s.tgt.lKnee = -1.5;
          s.tgt.rKnee = -1.5;
          s.tgt.torsoPitch = 0.08;
          return this.t >= this.dur; // pose persists (not reset)
        },
      };
    case 'stand':
      return {
        name: 'stand',
        t: 0,
        dur: 1,
        update(dt) {
          if (this.t === 0) {
            Object.assign(s.tgt, NEUTRAL);
          }
          this.t += dt;
          return this.t >= this.dur;
        },
      };
    case 'balance':
      return {
        name: 'balance',
        t: 0,
        dur: 4.5,
        update(dt) {
          if (this.t === 0) start();
          this.t += dt;
          s.tgt.torsoRoll = Math.sin(this.t * 2) * 0.16;
          s.tgt.headYaw = Math.sin(this.t * 2) * 0.1;
          s.tgt.lHip = Math.sin(this.t * 2) * 0.08;
          s.tgt.rHip = Math.sin(this.t * 2) * 0.08;
          return this.t >= this.dur;
        },
        onEnd: () => resetTransient(s),
      };
    case 'dance':
      return {
        name: 'dance',
        t: 0,
        dur: 4.5,
        update(dt) {
          if (this.t === 0) start();
          this.t += dt;
          const a = this.t * 6;
          s.tgt.lShR = -1.7 + Math.sin(a) * 0.6;
          s.tgt.rShR = 1.7 + Math.sin(a + Math.PI) * 0.6;
          s.tgt.torsoRoll = Math.sin(this.t * 3) * 0.2;
          s.tgt.headYaw = Math.sin(this.t * 3) * 0.22;
          s.tgt.rootY = Math.abs(Math.sin(a)) * 0.08;
          return this.t >= this.dur;
        },
        onEnd: () => resetTransient(s),
      };
    case 'reset':
    default:
      return {
        name: 'reset',
        t: 0,
        dur: 0.8,
        update(dt) {
          if (this.t === 0) {
            Object.assign(s.tgt, NEUTRAL);
            s.bx = 0;
            s.bz = 0;
            s.targetYaw = 0;
            s.tilt = 0;
            s.tiltVel = 0;
            s.fallen = false;
            s.cube = {x: CUBE_START.x, y: 0.18, z: CUBE_START.z, held: false};
          }
          this.t += dt;
          return this.t >= this.dur;
        },
      };
  }
}

/** Stand back up but keep arms holding the cube in front of the chest. */
function resetTransientKeepHold(s: SimState) {
  resetTransient(s);
  s.tgt.rShP = -0.7;
  s.tgt.lShP = -0.7;
  s.tgt.rEl = 1.0;
  s.tgt.lEl = 1.0;
}

/* ------------------------------ the robot ------------------------------ */

type RobotHandle = {
  run: (steps: PlanStep[]) => void;
  stop: () => void;
  push: (force: number) => void;
  reset: () => void;
};

function Robot({
  apiRef,
  onState,
}: {
  apiRef: React.MutableRefObject<RobotHandle | null>;
  onState: (st: RobotStatus) => void;
}) {
  const s = useRef<SimState>(freshState()).current;

  const root = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const shL = useRef<THREE.Group>(null);
  const shR = useRef<THREE.Group>(null);
  const elL = useRef<THREE.Group>(null);
  const elR = useRef<THREE.Group>(null);
  const hipL = useRef<THREE.Group>(null);
  const hipR = useRef<THREE.Group>(null);
  const knL = useRef<THREE.Group>(null);
  const knR = useRef<THREE.Group>(null);
  const anchor = useRef<THREE.Group>(null);
  const cube = useRef<THREE.Mesh>(null);
  const eyeL = useRef<THREE.Mesh>(null);
  const eyeR = useRef<THREE.Mesh>(null);

  const last = useRef<RobotStatus>({busy: false, action: 'idle', held: false, fallen: false});
  const tmp = useRef(new THREE.Vector3()).current;

  useEffect(() => {
    apiRef.current = {
      run(steps) {
        for (const step of steps) s.queue.push(buildAction(step, s));
      },
      stop() {
        s.queue.length = 0;
        s.current = null;
        resetTransient(s);
      },
      push(force) {
        s.tiltVel += force;
      },
      reset() {
        s.queue.length = 0;
        s.current = buildAction({skill: 'reset'}, s);
      },
    };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef, s]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    s.clock += dt;

    // action queue
    if (!s.current && s.queue.length) {
      s.current = s.queue.shift() ?? null;
    }
    if (s.current) {
      const done = s.current.update(dt);
      if (done) {
        s.current.onEnd?.();
        s.current = null;
      }
    } else {
      // livelier idle: breathing + a slow weight shift and glance
      s.tgt.torsoPitch = Math.sin(s.clock * 1.4) * 0.02;
      s.tgt.headPitch = Math.sin(s.clock * 1.4) * 0.015;
      s.tgt.torsoRoll = Math.sin(s.clock * 0.55) * 0.03;
      s.tgt.headYaw = Math.sin(s.clock * 0.4) * 0.05;
    }

    // balance spring / fall + recover
    if (s.fallen) {
      s.tilt = damp(s.tilt, 1.35, 4, dt);
      s.fallTimer += dt;
      if (s.fallTimer > 1.8) {
        s.fallen = false;
        s.tiltVel = 0;
      }
    } else {
      s.tiltVel += (-20 * s.tilt - 5 * s.tiltVel) * dt;
      s.tilt += s.tiltVel * dt;
      if (Math.abs(s.tilt) > 0.62) {
        s.fallen = true;
        s.fallTimer = 0;
      }
    }

    // integrate facing
    s.yaw = damp(s.yaw, s.targetYaw, 8, dt);

    // damp all channels toward target
    (Object.keys(NEUTRAL) as (keyof Channels)[]).forEach((k) => {
      s.cur[k] = damp(s.cur[k], s.tgt[k], 10, dt);
    });

    // apply to rig
    if (root.current) {
      root.current.position.set(s.bx, s.cur.rootY, s.bz);
      root.current.rotation.set(0, s.yaw, s.tilt);
    }
    head.current?.rotation.set(s.cur.headPitch, s.cur.headYaw, 0);
    torso.current?.rotation.set(s.cur.torsoPitch, 0, s.cur.torsoRoll);
    shL.current?.rotation.set(s.cur.lShP, 0, s.cur.lShR);
    shR.current?.rotation.set(s.cur.rShP, 0, s.cur.rShR);
    if (elL.current) elL.current.rotation.x = s.cur.lEl;
    if (elR.current) elR.current.rotation.x = s.cur.rEl;
    if (hipL.current) hipL.current.rotation.x = s.cur.lHip;
    if (hipR.current) hipR.current.rotation.x = s.cur.rHip;
    if (knL.current) knL.current.rotation.x = s.cur.lKnee;
    if (knR.current) knR.current.rotation.x = s.cur.rKnee;

    // eye blink: a quick squash roughly every 4.5s
    const blink = s.clock % 4.5 < 0.12 ? 0.12 : 1;
    if (eyeL.current) eyeL.current.scale.y = blink;
    if (eyeR.current) eyeR.current.scale.y = blink;

    // cube: follow the chest anchor when held, else rest on the ground
    if (cube.current) {
      if (s.cube.held && anchor.current) {
        anchor.current.getWorldPosition(tmp);
        cube.current.position.copy(tmp);
        cube.current.rotation.y = s.yaw;
      } else {
        cube.current.position.set(s.cube.x, s.cube.y, s.cube.z);
      }
    }

    // report status changes
    const st: RobotStatus = {
      busy: Boolean(s.current) || s.queue.length > 0,
      action: s.current?.name ?? 'idle',
      held: s.cube.held,
      fallen: s.fallen,
    };
    const l = last.current;
    if (st.busy !== l.busy || st.action !== l.action || st.held !== l.held || st.fallen !== l.fallen) {
      last.current = st;
      onState(st);
    }
  });

  const skin = '#0e7490';
  const accent = '#22d3ee';
  const dark = '#0a2f3f';
  const eye = '#7ef0ff';

  return (
    <>
      {/* the cube lives in world space, not parented to the robot */}
      <RoundedBox
        ref={cube}
        args={[0.34, 0.34, 0.34]}
        radius={0.05}
        smoothness={4}
        castShadow
        position={[CUBE_START.x, 0.18, CUBE_START.z]}>
        <meshStandardMaterial color="#f59e0b" metalness={0.2} roughness={0.4} />
      </RoundedBox>

      <group ref={root}>
        {/* pelvis */}
        <RoundedBox args={[0.42, 0.22, 0.28]} radius={0.06} smoothness={4} position={[0, 0.9, 0]} castShadow>
          <meshStandardMaterial color={dark} metalness={0.5} roughness={0.4} />
        </RoundedBox>

        {/* torso (pivots at the waist) */}
        <group ref={torso} position={[0, 0.9, 0]}>
          <RoundedBox args={[0.5, 0.62, 0.3]} radius={0.08} smoothness={4} position={[0, 0.32, 0]} castShadow>
            <meshStandardMaterial color={skin} metalness={0.38} roughness={0.42} />
          </RoundedBox>
          <RoundedBox args={[0.22, 0.32, 0.04]} radius={0.02} smoothness={3} position={[0, 0.32, 0.15]} castShadow>
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.5} roughness={0.3} />
          </RoundedBox>

          {/* chest anchor for a held object */}
          <group ref={anchor} position={[0, 0.16, 0.34]} />

          {/* head */}
          <group ref={head} position={[0, 0.74, 0]}>
            <RoundedBox args={[0.34, 0.32, 0.32]} radius={0.09} smoothness={5} castShadow>
              <meshStandardMaterial color={accent} metalness={0.45} roughness={0.35} />
            </RoundedBox>
            {/* visor */}
            <RoundedBox args={[0.26, 0.12, 0.02]} radius={0.05} smoothness={4} position={[0, 0.02, 0.16]}>
              <meshStandardMaterial color="#062a30" metalness={0.3} roughness={0.25} />
            </RoundedBox>
            <mesh ref={eyeL} position={[0.07, 0.02, 0.18]}>
              <sphereGeometry args={[0.036, 16, 16]} />
              <meshStandardMaterial color={eye} emissive={eye} emissiveIntensity={1.6} toneMapped={false} />
            </mesh>
            <mesh ref={eyeR} position={[-0.07, 0.02, 0.18]}>
              <sphereGeometry args={[0.036, 16, 16]} />
              <meshStandardMaterial color={eye} emissive={eye} emissiveIntensity={1.6} toneMapped={false} />
            </mesh>
          </group>

          {/* left arm */}
          <group ref={shL} position={[-0.32, 0.56, 0]}>
            {/* shoulder ball */}
            <mesh castShadow>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color={accent} metalness={0.5} roughness={0.4} />
            </mesh>
            <RoundedBox args={[0.13, 0.36, 0.13]} radius={0.05} smoothness={4} position={[0, -0.18, 0]} castShadow>
              <meshStandardMaterial color={dark} metalness={0.5} roughness={0.4} />
            </RoundedBox>
            <group ref={elL} position={[0, -0.36, 0]}>
              <RoundedBox args={[0.115, 0.34, 0.115]} radius={0.045} smoothness={4} position={[0, -0.17, 0]} castShadow>
                <meshStandardMaterial color={skin} metalness={0.38} roughness={0.42} />
              </RoundedBox>
            </group>
          </group>

          {/* right arm */}
          <group ref={shR} position={[0.32, 0.56, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color={accent} metalness={0.5} roughness={0.4} />
            </mesh>
            <RoundedBox args={[0.13, 0.36, 0.13]} radius={0.05} smoothness={4} position={[0, -0.18, 0]} castShadow>
              <meshStandardMaterial color={dark} metalness={0.5} roughness={0.4} />
            </RoundedBox>
            <group ref={elR} position={[0, -0.36, 0]}>
              <RoundedBox args={[0.115, 0.34, 0.115]} radius={0.045} smoothness={4} position={[0, -0.17, 0]} castShadow>
                <meshStandardMaterial color={skin} metalness={0.38} roughness={0.42} />
              </RoundedBox>
            </group>
          </group>
        </group>

        {/* left leg */}
        <group ref={hipL} position={[-0.13, 0.9, 0]}>
          <RoundedBox args={[0.16, 0.46, 0.16]} radius={0.06} smoothness={4} position={[0, -0.23, 0]} castShadow>
            <meshStandardMaterial color={skin} metalness={0.38} roughness={0.42} />
          </RoundedBox>
          <group ref={knL} position={[0, -0.46, 0]}>
            <RoundedBox args={[0.14, 0.44, 0.14]} radius={0.05} smoothness={4} position={[0, -0.22, 0]} castShadow>
              <meshStandardMaterial color={dark} metalness={0.5} roughness={0.4} />
            </RoundedBox>
            <RoundedBox args={[0.17, 0.09, 0.3]} radius={0.03} smoothness={3} position={[0, -0.44, 0.06]} castShadow>
              <meshStandardMaterial color={dark} metalness={0.5} roughness={0.4} />
            </RoundedBox>
          </group>
        </group>

        {/* right leg */}
        <group ref={hipR} position={[0.13, 0.9, 0]}>
          <RoundedBox args={[0.16, 0.46, 0.16]} radius={0.06} smoothness={4} position={[0, -0.23, 0]} castShadow>
            <meshStandardMaterial color={skin} metalness={0.38} roughness={0.42} />
          </RoundedBox>
          <group ref={knR} position={[0, -0.46, 0]}>
            <RoundedBox args={[0.14, 0.44, 0.14]} radius={0.05} smoothness={4} position={[0, -0.22, 0]} castShadow>
              <meshStandardMaterial color={dark} metalness={0.5} roughness={0.4} />
            </RoundedBox>
            <RoundedBox args={[0.17, 0.09, 0.3]} radius={0.03} smoothness={3} position={[0, -0.44, 0.06]} castShadow>
              <meshStandardMaterial color={dark} metalness={0.5} roughness={0.4} />
            </RoundedBox>
          </group>
        </group>
      </group>
    </>
  );
}

/* ------------------------------ scene shell ---------------------------- */

function Scene({
  apiRef,
  onState,
}: {
  apiRef: React.MutableRefObject<RobotHandle | null>;
  onState: (st: RobotStatus) => void;
}) {
  return (
    <Canvas
      shadows
      camera={{position: [2.8, 2.1, 3.6], fov: 42}}
      dpr={[1, 2]}
      gl={{antialias: true}}>
      <color attach="background" args={['#0b1626']} />
      <fog attach="fog" args={['#0b1626', 9, 18]} />
      <SoftShadows size={26} samples={12} focus={0.9} />

      {/* key + fill + cyan rim so the mascot reads with depth */}
      <hemisphereLight intensity={0.5} groundColor="#0a1420" color="#bde8f5" />
      <directionalLight
        position={[4, 6, 3]}
        intensity={1.7}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}>
        <orthographicCamera attach="shadow-camera" args={[-4, 4, 4, -4, 0.1, 20]} />
      </directionalLight>
      <directionalLight position={[-5, 3, -4]} intensity={0.7} color="#22d3ee" />
      <pointLight position={[0, 2.4, 2.5]} intensity={12} distance={9} color="#8be9fd" />

      {/* faded grid + subtly reflective floor (no network assets) */}
      <gridHelper args={[26, 26, '#12475a', '#0e2f3d']} position={[0, 0.002, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <MeshReflectorMaterial
          resolution={512}
          mixBlur={1}
          mixStrength={2.2}
          blur={[400, 100]}
          roughness={0.92}
          depthScale={1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.2}
          color="#0c1a29"
          metalness={0.4}
          mirror={0}
        />
      </mesh>
      <ContactShadows position={[0, 0.012, 0]} opacity={0.55} scale={11} blur={2.6} far={4.5} />

      <Robot apiRef={apiRef} onState={onState} />
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={2.5}
        maxDistance={9}
        maxPolarAngle={Math.PI / 2 - 0.05}
        target={[0, 0.9, 0]}
      />
    </Canvas>
  );
}

/* ------------------------------ the lab UI ----------------------------- */

function resolveEndpoint(agentEndpoint?: string): string {
  if (agentEndpoint) return agentEndpoint;
  return process.env.NODE_ENV === 'development'
    ? 'http://127.0.0.1:8787/api/agent'
    : '/api/agent';
}

export default function Lab() {
  const {siteConfig} = useDocusaurusContext();
  const endpoint = resolveEndpoint(
    siteConfig.customFields?.agentEndpoint as string | undefined,
  );

  const apiRef = useRef<RobotHandle | null>(null);
  const [status, setStatus] = useState<RobotStatus>({
    busy: false,
    action: 'idle',
    held: false,
    fallen: false,
  });
  const [command, setCommand] = useState('');
  const [thinking, setThinking] = useState(false);
  const [say, setSay] = useState('');
  const [plan, setPlan] = useState<PlanStep[]>([]);
  const [source, setSource] = useState<'ai' | 'local' | ''>('');

  const runStep = useCallback((step: PlanStep) => {
    apiRef.current?.run([step]);
  }, []);

  const runPlan = useCallback((p: Plan, src: 'ai' | 'local') => {
    setPlan(p.plan);
    setSay(p.say);
    setSource(src);
    if (p.plan.length) apiRef.current?.run(p.plan);
  }, []);

  const submit = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || thinking) return;
      setThinking(true);
      setSay('');
      setPlan([]);
      setSource('');
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            mode: 'robot',
            stream: false,
            messages: [{role: 'user', content}],
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const steps = sanitizePlan(data?.plan);
        if (steps.length) {
          runPlan({plan: steps, say: data?.say || 'On it.'}, 'ai');
        } else {
          runPlan(parseCommandLocal(content), 'local');
        }
      } catch {
        // No API key / offline — fall back to the local keyword planner.
        runPlan(parseCommandLocal(content), 'local');
      } finally {
        setThinking(false);
      }
    },
    [endpoint, runPlan, thinking],
  );

  return (
    <div className={styles.lab}>
      <div className={styles.stage}>
        <Scene apiRef={apiRef} onState={setStatus} />
        <div className={styles.hud}>
          <span className={`${styles.pill} ${status.busy ? styles.pillBusy : ''}`}>
            {status.busy ? `▶ ${status.action}` : '● idle'}
          </span>
          {status.held && <span className={styles.pill}>📦 holding cube</span>}
          {status.fallen && <span className={`${styles.pill} ${styles.pillWarn}`}>⚠ recovering…</span>}
        </div>
        <div className={styles.hint}>drag to orbit · scroll to zoom</div>
      </div>

      <form
        className={styles.commandBar}
        onSubmit={(e) => {
          e.preventDefault();
          void submit(command);
        }}>
        <input
          className={styles.commandInput}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder='Tell the robot what to do — e.g. "walk to the cube and pick it up"'
          aria-label="Command the robot in natural language"
        />
        <button className={styles.commandSend} type="submit" disabled={thinking || !command.trim()}>
          {thinking ? 'Planning…' : 'Send'}
        </button>
      </form>

      <div className={styles.examples}>
        {EXAMPLE_COMMANDS.map((c) => (
          <button
            key={c}
            type="button"
            className={styles.example}
            onClick={() => {
              setCommand(c);
              void submit(c);
            }}>
            {c}
          </button>
        ))}
      </div>

      {(say || plan.length > 0) && (
        <div className={styles.planPanel}>
          {say && (
            <div className={styles.robotSay}>
              <strong>Robot:</strong> {say}
              {source === 'ai' ? (
                <span className={styles.badgeAi}>AI plan</span>
              ) : source === 'local' ? (
                <span className={styles.badgeLocal}>local plan</span>
              ) : null}
            </div>
          )}
          {plan.length > 0 && (
            <ol className={styles.planList}>
              {plan.map((step, i) => (
                <li key={i}>
                  <code>{step.skill}</code>
                  {step.params && Object.keys(step.params).length > 0 && (
                    <span className={styles.planParams}>
                      {' '}
                      {Object.entries(step.params)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ')}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <div className={styles.controlLabel}>Skills</div>
          <div className={styles.skillGrid}>
            {SKILL_BUTTONS.map((b) => (
              <button
                key={b.label}
                type="button"
                className={styles.skillBtn}
                onClick={() => runStep(b.step)}>
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.controlGroup}>
          <div className={styles.controlLabel}>Balance &amp; physics</div>
          <p className={styles.controlHelp}>
            The robot keeps its balance with a spring-damper controller. Push it — a hard
            enough shove makes it topple, then recover.
          </p>
          <div className={styles.pushRow}>
            <button
              type="button"
              className={styles.pushBtn}
              onClick={() => apiRef.current?.push(-2.2)}>
              ⬅ Nudge
            </button>
            <button
              type="button"
              className={styles.pushBtn}
              onClick={() => apiRef.current?.push(-4.5)}>
              ⬅ Shove
            </button>
            <button
              type="button"
              className={styles.pushBtn}
              onClick={() => apiRef.current?.push(4.5)}>
              Shove ➡
            </button>
            <button
              type="button"
              className={styles.pushBtn}
              onClick={() => apiRef.current?.push(2.2)}>
              Nudge ➡
            </button>
          </div>
          <div className={styles.pushRow}>
            <button type="button" className={styles.stopBtn} onClick={() => apiRef.current?.stop()}>
              ■ Stop
            </button>
            <button
              type="button"
              className={styles.stopBtn}
              onClick={() => apiRef.current?.reset()}>
              ↺ Reset scene
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
