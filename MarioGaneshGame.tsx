import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Play, 
  RotateCcw, 
  Trophy, 
  Sparkles, 
  Heart, 
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  ArrowRight, 
  ArrowUp, 
  Pause,
  ChevronRight
} from 'lucide-react';
import { PlayerProfile } from '../types';
import { soundEngine } from '../utils/audio';
import { addLeaderboardScore } from '../utils/storage';

interface Props {
  playerProfile: PlayerProfile;
  onOpenLeaderboard: () => void;
}

// Block Types: Rich Terracotta floor, carved temple pedestals (no pipe tunnels)
type BlockType = 'ground' | 'brick' | 'pedestal' | 'question_modak' | 'question_super' | 'empty';

export type ModakType = 'regular' | 'rare_trishul' | 'rare_lotus' | 'rare_shield' | 'rare_amrit';
export type PowerItemType = 'super_modak' | 'trishul' | 'lotus' | 'shield';

interface Block {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  type: BlockType;
  bumpY: number;
  isHit: boolean;
}

interface FloatingModak {
  id: number;
  x: number;
  baseY: number;
  y: number;
  w: number;
  h: number;
  type: ModakType;
  collected: boolean;
}

interface SuperModakItem {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  type: PowerItemType;
  collected: boolean;
}

interface ThunderSpark {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  type: 'monkey' | 'coconut' | 'fire_demon';
  isSquished: boolean;
  squishTimer: number;
  isDead: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  isPetal?: boolean;
}

interface FireworkRocket {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  color: string;
}

interface FireworkSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  life: number;
  size: number;
}

interface ScorePopup {
  id: number;
  x: number;
  y: number;
  text: string;
  alpha: number;
  color: string;
}

interface ExpandingRing {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
}

export interface TempleGoal {
  stambhaX: number;
  stambhaY: number;
  stambhaH: number;
  bellX: number;
  bellY: number;
  bellSwing: number;
  bellSwingVel: number;
  isRung: boolean;
  templeX: number;
  templeY: number;
  templeW: number;
  templeH: number;
}

export interface StageConfig {
  num: number;
  name: string;
  hindiName: string;
  subtitle: string;
  levelWidth: number;
  canalGaps: { start: number; end: number }[];
  pedestals: number[];
  enemyCount: number;
  enemyBaseSpeed: number;
  powerShrineX: number[];
  skyTop: string;
  skyMid: string;
  skyBottom: string;
  templeColor: string;
  kalashCount: number;
}

export const STAGE_CONFIGS: StageConfig[] = [
  {
    num: 1,
    name: 'Anand Mandir',
    hindiName: 'आनन्द मन्दिर',
    subtitle: 'Gateway of Joy & Blessings',
    levelWidth: 3600,
    canalGaps: [
      { start: 1100, end: 1190 },
      { start: 2250, end: 2340 },
    ],
    pedestals: [480, 820, 1550, 2000, 2750],
    enemyCount: 8,
    enemyBaseSpeed: 52,
    powerShrineX: [1350, 2450],
    skyTop: '#060919',
    skyMid: '#0F172A',
    skyBottom: '#1E1B4B',
    templeColor: '#831843',
    kalashCount: 3,
  },
  {
    num: 2,
    name: 'Pushkar Sarovar',
    hindiName: 'पुष्कर सरोवर',
    subtitle: 'Sacred Lotus Waterway',
    levelWidth: 3800,
    canalGaps: [
      { start: 920, end: 1030 },
      { start: 1850, end: 1960 },
      { start: 2750, end: 2870 },
    ],
    pedestals: [500, 850, 1400, 2200, 3050],
    enemyCount: 11,
    enemyBaseSpeed: 60,
    powerShrineX: [1420, 2600],
    skyTop: '#070D24',
    skyMid: '#131D45',
    skyBottom: '#231B54',
    templeColor: '#701A75',
    kalashCount: 3,
  },
  {
    num: 3,
    name: 'Chitrakoot Steppes',
    hindiName: 'चित्रकूट शिला',
    subtitle: 'Terracotta High Cliffs',
    levelWidth: 4000,
    canalGaps: [
      { start: 880, end: 1000 },
      { start: 1700, end: 1830 },
      { start: 2500, end: 2640 },
      { start: 3200, end: 3340 },
    ],
    pedestals: [460, 800, 1320, 2050, 2780, 3420],
    enemyCount: 14,
    enemyBaseSpeed: 68,
    powerShrineX: [1520, 2850],
    skyTop: '#09081E',
    skyMid: '#1A183E',
    skyBottom: '#2D1B4E',
    templeColor: '#881337',
    kalashCount: 3,
  },
  {
    num: 4,
    name: 'Kashi Ghats',
    hindiName: 'काशी धाम',
    subtitle: 'Corridor of Divine Lights',
    levelWidth: 4200,
    canalGaps: [
      { start: 850, end: 980 },
      { start: 1600, end: 1740 },
      { start: 2360, end: 2510 },
      { start: 3120, end: 3280 },
    ],
    pedestals: [440, 800, 1260, 1950, 2680, 3380],
    enemyCount: 17,
    enemyBaseSpeed: 75,
    powerShrineX: [1620, 3050],
    skyTop: '#0B0A26',
    skyMid: '#1C1542',
    skyBottom: '#341B54',
    templeColor: '#7C2D12',
    kalashCount: 3,
  },
  {
    num: 5,
    name: 'Panchvati Vatika',
    hindiName: 'पंचवटी वाटिका',
    subtitle: 'Ancient Grove of Wisdom',
    levelWidth: 4400,
    canalGaps: [
      { start: 800, end: 940 },
      { start: 1540, end: 1690 },
      { start: 2280, end: 2440 },
      { start: 3000, end: 3170 },
      { start: 3660, end: 3830 },
    ],
    pedestals: [420, 760, 1200, 1850, 2550, 3250, 3880],
    enemyCount: 20,
    enemyBaseSpeed: 82,
    powerShrineX: [1750, 3200],
    skyTop: '#060B1E',
    skyMid: '#10223D',
    skyBottom: '#1B2C4E',
    templeColor: '#065F46',
    kalashCount: 3,
  },
  {
    num: 6,
    name: 'Sudarshan Shikhar',
    hindiName: 'सुदर्शन शिखर',
    subtitle: 'Chakra Ridge of Protection',
    levelWidth: 4600,
    canalGaps: [
      { start: 820, end: 970 },
      { start: 1500, end: 1660 },
      { start: 2220, end: 2390 },
      { start: 2950, end: 3130 },
      { start: 3720, end: 3900 },
    ],
    pedestals: [440, 790, 1280, 1900, 2600, 3300, 3980],
    enemyCount: 23,
    enemyBaseSpeed: 88,
    powerShrineX: [1850, 3400],
    skyTop: '#061324',
    skyMid: '#0F2744',
    skyBottom: '#193354',
    templeColor: '#1E3A8A',
    kalashCount: 3,
  },
  {
    num: 7,
    name: 'Kailash Dwar',
    hindiName: 'कैलाश द्वार',
    subtitle: 'Mystic Mountain Gateway',
    levelWidth: 4800,
    canalGaps: [
      { start: 780, end: 940 },
      { start: 1450, end: 1620 },
      { start: 2150, end: 2330 },
      { start: 2850, end: 3040 },
      { start: 3550, end: 3740 },
      { start: 4160, end: 4350 },
    ],
    pedestals: [400, 740, 1200, 1800, 2450, 3100, 3800, 4380],
    enemyCount: 26,
    enemyBaseSpeed: 94,
    powerShrineX: [1950, 3600],
    skyTop: '#080E29',
    skyMid: '#162348',
    skyBottom: '#281E52',
    templeColor: '#4C1D95',
    kalashCount: 3,
  },
  {
    num: 8,
    name: 'Vayu Patha',
    hindiName: 'वायु पथ',
    subtitle: 'Sky Bridges of the Vanaras',
    levelWidth: 5000,
    canalGaps: [
      { start: 750, end: 920 },
      { start: 1400, end: 1580 },
      { start: 2100, end: 2290 },
      { start: 2800, end: 3000 },
      { start: 3500, end: 3710 },
      { start: 4200, end: 4410 },
    ],
    pedestals: [420, 720, 1220, 1820, 2480, 3150, 3850, 4480],
    enemyCount: 29,
    enemyBaseSpeed: 100,
    powerShrineX: [2050, 3800],
    skyTop: '#100B2B',
    skyMid: '#24144A',
    skyBottom: '#3B1854',
    templeColor: '#581C87',
    kalashCount: 4,
  },
  {
    num: 9,
    name: 'Agni Tirtha',
    hindiName: 'अग्नि तीर्थ',
    subtitle: 'Trial of Sacred Fire & Resolve',
    levelWidth: 5200,
    canalGaps: [
      { start: 720, end: 900 },
      { start: 1350, end: 1540 },
      { start: 2000, end: 2200 },
      { start: 2700, end: 2910 },
      { start: 3400, end: 3620 },
      { start: 4100, end: 4320 },
      { start: 4700, end: 4920 },
    ],
    pedestals: [400, 680, 1150, 1720, 2350, 3050, 3750, 4400],
    enemyCount: 32,
    enemyBaseSpeed: 108,
    powerShrineX: [2150, 4000],
    skyTop: '#17071A',
    skyMid: '#340C2E',
    skyBottom: '#4A112C',
    templeColor: '#991B1B',
    kalashCount: 4,
  },
  {
    num: 10,
    name: 'Maha Ganesha Darshan',
    hindiName: 'महा गणेश दर्शन',
    subtitle: 'The Supreme Siddhivinayak Sanctum',
    levelWidth: 5400,
    canalGaps: [
      { start: 700, end: 890 },
      { start: 1300, end: 1500 },
      { start: 1940, end: 2150 },
      { start: 2600, end: 2820 },
      { start: 3300, end: 3530 },
      { start: 4000, end: 4240 },
      { start: 4680, end: 4920 },
    ],
    pedestals: [380, 650, 1100, 1680, 2280, 2950, 3650, 4320],
    enemyCount: 36,
    enemyBaseSpeed: 116,
    powerShrineX: [2250, 4200],
    skyTop: '#0D0924',
    skyMid: '#211347',
    skyBottom: '#3B1854',
    templeColor: '#B45309',
    kalashCount: 5,
  },
];

export const MarioGaneshGame: React.FC<Props> = ({
  playerProfile,
  onOpenLeaderboard,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // React UI States
  const [stage, setStage] = useState<number>(1);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'paused' | 'stage_clear' | 'game_over'>('start');
  const [score, setScore] = useState(0);
  const [modaks, setModaks] = useState(0);
  const [lives, setLives] = useState(3);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [timeLeft, setTimeLeft] = useState(360);
  const [isSuper, setIsSuper] = useState(false);
  const [hasTrishul, setHasTrishul] = useState(false);
  const [hasLotusGlide, setHasLotusGlide] = useState(false);
  const [shieldCharges, setShieldCharges] = useState(0);
  const [lotusTimerSec, setLotusTimerSec] = useState(0);
  const [trishulTimerSec, setTrishulTimerSec] = useState(0);
  const [superTimerSec, setSuperTimerSec] = useState(0);
  const [shieldTimerSec, setShieldTimerSec] = useState(0);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());

  // Input states
  const keysRef = useRef<{
    left: boolean;
    right: boolean;
    jump: boolean;
    jumpPressedThisFrame: boolean;
    action: boolean;
    actionPressedThisFrame: boolean;
  }>({
    left: false,
    right: false,
    jump: false,
    jumpPressedThisFrame: false,
    action: false,
    actionPressedThisFrame: false,
  });

  // Game Engine Ref
  const engineRef = useRef<{
    player: {
      x: number;
      y: number;
      w: number;
      h: number;
      vx: number;
      vy: number;
      isGrounded: boolean;
      facing: 'left' | 'right';
      isSuper: boolean;
      canDoubleJump: boolean;
      invulnerableTimer: number;
      runAnimFrame: number;
      coyoteTimer: number;
      jumpBufferTimer: number;
      hasTrishul: boolean;
      hasLotusGlide: boolean;
      shieldCharges: number;
      isGliding: boolean;
      zapCooldown: number;
      lotusTimer: number;
      trishulTimer: number;
      superTimer: number;
      shieldTimer: number;
    };
    cameraX: number;
    levelWidth: number;
    blocks: Block[];
    floatingModaks: FloatingModak[];
    superItems: SuperModakItem[];
    thunderSparks: ThunderSpark[];
    enemies: Enemy[];
    particles: Particle[];
    fireworkRockets: FireworkRocket[];
    fireworkSparks: FireworkSpark[];
    skyFlashAlpha: number;
    fireworkTimer: number;
    scorePopups: ScorePopup[];
    expandingRings: ExpandingRing[];
    flagpole: { x: number; y: number; h: number; flagY: number; reached: boolean };
    templeSanctum: { x: number; y: number; w: number; h: number };
    templeGoal: TempleGoal;
    score: number;
    modaks: number;
    lives: number;
    timeRemaining: number;
    isClearing: boolean;
    clearTimer: number;
    isDeadAnim: boolean;
    deadTimer: number;
    gameTime: number;
  }>({
    player: {
      x: 80,
      y: 280,
      w: 34,
      h: 36,
      vx: 0,
      vy: 0,
      isGrounded: false,
      facing: 'right',
      isSuper: false,
      canDoubleJump: true,
      invulnerableTimer: 0,
      runAnimFrame: 0,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      hasTrishul: false,
      hasLotusGlide: false,
      shieldCharges: 0,
      isGliding: false,
      zapCooldown: 0,
      lotusTimer: 0,
      trishulTimer: 0,
      superTimer: 0,
      shieldTimer: 0,
    },
    cameraX: 0,
    levelWidth: 4200,
    blocks: [],
    floatingModaks: [],
    superItems: [],
    thunderSparks: [],
    enemies: [],
    particles: [],
    fireworkRockets: [],
    fireworkSparks: [],
    skyFlashAlpha: 0,
    fireworkTimer: 0.5,
    scorePopups: [],
    expandingRings: [],
    flagpole: { x: 3400, y: 110, h: 270, flagY: 120, reached: false },
    templeSanctum: { x: 3490, y: 140, w: 240, h: 240 },
    templeGoal: {
      stambhaX: 3340,
      stambhaY: 120,
      stambhaH: 260,
      bellX: 3362,
      bellY: 150,
      bellSwing: 0,
      bellSwingVel: 0,
      isRung: false,
      templeX: 3420,
      templeY: 380,
      templeW: 240,
      templeH: 260,
    },
    score: 0,
    modaks: 0,
    lives: 3,
    timeRemaining: 360,
    isClearing: false,
    clearTimer: 0,
    isDeadAnim: false,
    deadTimer: 0,
    gameTime: 0,
  });

  // Build Level with Terracotta Lotus Floor, Stepped Pedestals, Modaks, and Progressive Difficulty
  const buildLevel = useCallback((stageNum: number) => {
    const blocks: Block[] = [];
    const floatingModaks: FloatingModak[] = [];
    const enemies: Enemy[] = [];
    const groundY = 380;
    const blockSize = 40;

    const cfg = STAGE_CONFIGS[Math.max(0, Math.min(STAGE_CONFIGS.length - 1, stageNum - 1))];
    const levelWidth = cfg.levelWidth;

    let id = 1;

    // Helper: Add Terracotta & Lotus Floor (Ground) - Strictly Single Block
    const addGround = (startX: number, endX: number) => {
      for (let x = startX; x < endX; x += blockSize) {
        blocks.push({
          id: id++,
          x,
          y: groundY,
          w: blockSize,
          h: blockSize,
          type: 'ground',
          bumpY: 0,
          isHit: false,
        });
      }
    };

    // Canal gaps from stage configuration
    let curX = 0;
    cfg.canalGaps.forEach((gap) => {
      addGround(curX, gap.start);
      curX = gap.end;
    });
    addGround(curX, levelWidth);

    // Decorative Stepped Temple Pedestals from stage configuration
    cfg.pedestals.forEach((px, idx) => {
      const steps = 1 + (idx % 3);
      for (let s = 0; s < steps; s++) {
        blocks.push({
          id: id++,
          x: px,
          y: groundY - (s + 1) * blockSize,
          w: blockSize * 1.5,
          h: blockSize,
          type: 'pedestal',
          bumpY: 0,
          isHit: false,
        });
      }
    });

    // Helper: Floating Modak Rows with Sinusoidal Height
    const addModakRow = (
      startX: number,
      y: number,
      count: number,
      spacing: number = 42,
      rareType?: ModakType
    ) => {
      for (let i = 0; i < count; i++) {
        let type: ModakType = 'regular';
        if (rareType && i === Math.floor(count / 2)) {
          type = rareType;
        }
        floatingModaks.push({
          id: id++,
          x: startX + i * spacing,
          baseY: y,
          y,
          w: 26,
          h: 28,
          type,
          collected: false,
        });
      }
    };

    // Distribute floating regular modak clusters throughout the level
    for (let mx = 240; mx < levelWidth - 520; mx += 340) {
      addModakRow(mx, 310, 3);
    }

    // Pedestal Modaks: Mostly sweet golden modaks, with ONLY ONE designated rare divine power per stage!
    // This makes powers rewarding to seek out and skill-based, rather than overly easy and abundant.
    const rareAbilityType: ModakType =
      stageNum % 4 === 1 ? 'rare_lotus' :
      stageNum % 4 === 2 ? 'rare_trishul' :
      stageNum % 4 === 3 ? 'rare_shield' :
      'rare_amrit';

    // Place the rare powerup on the 3rd pedestal (or second to last), elevated higher for a skilled jump
    const specialPedestalIdx = Math.min(cfg.pedestals.length - 2, 2);

    cfg.pedestals.forEach((px, idx) => {
      const isSpecial = idx === specialPedestalIdx;
      const steps = isSpecial ? 3 : 1 + (idx % 2);
      floatingModaks.push({
        id: id++,
        x: px + 12,
        baseY: groundY - steps * blockSize - 52,
        y: groundY - steps * blockSize - 52,
        w: 28,
        h: 30,
        type: isSpecial ? rareAbilityType : 'regular',
        collected: false,
      });
    });

    // Mystery Question Shrines & Bricks:
    // 1. Guaranteed Sacred Ability Power Shrines [ ? ] at each configured powerShrineX (e.g. x = 280 early on!)
    cfg.powerShrineX.forEach((px) => {
      const py = groundY - blockSize * 3;
      blocks.push({
        id: id++,
        x: px,
        y: py,
        w: blockSize,
        h: blockSize,
        type: 'question_super',
        bumpY: 0,
        isHit: false,
      });

      // Flanking ornamental carved temple bricks
      blocks.push({ id: id++, x: px - blockSize, y: py, w: blockSize, h: blockSize, type: 'brick', bumpY: 0, isHit: false });
      blocks.push({ id: id++, x: px + blockSize, y: py, w: blockSize, h: blockSize, type: 'brick', bumpY: 0, isHit: false });
    });

    // 2. Intermediate regular modak question shrines along the path
    for (let bx = 520; bx < levelWidth - 550; bx += 380) {
      // Don't overlap with powerShrineX
      if (cfg.powerShrineX.some((px) => Math.abs(px - bx) < 70)) continue;
      const by = groundY - blockSize * (3 + ((bx % 2) * 0.8));
      blocks.push({
        id: id++,
        x: bx,
        y: by,
        w: blockSize,
        h: blockSize,
        type: 'question_modak',
        bumpY: 0,
        isHit: false,
      });
    }

    // Grand Entrance Staircase before the Temple Sanctum
    const stairX = levelWidth - 520;
    for (let step = 1; step <= 6; step++) {
      for (let sY = 1; sY <= step; sY++) {
        blocks.push({
          id: id++,
          x: stairX + step * blockSize,
          y: groundY - sY * blockSize,
          w: blockSize,
          h: blockSize,
          type: 'brick',
          bumpY: 0,
          isHit: false,
        });
      }
    }

    // Enemies scaled to stage difficulty
    let enemyId = 1;
    const enemySpacing = Math.floor((levelWidth - 850) / cfg.enemyCount);
    for (let e = 0; e < cfg.enemyCount; e++) {
      const ex = 480 + e * enemySpacing;
      let type: 'monkey' | 'coconut' | 'fire_demon' = 'monkey';
      if (stageNum <= 2) {
        type = e % 4 === 0 ? 'coconut' : 'monkey';
      } else if (stageNum <= 5) {
        type = e % 3 === 0 ? 'coconut' : e % 5 === 0 ? 'fire_demon' : 'monkey';
      } else {
        type = e % 3 === 0 ? 'coconut' : e % 3 === 1 ? 'fire_demon' : 'monkey';
      }

      enemies.push({
        id: enemyId++,
        x: ex,
        y: groundY - 32,
        w: 32,
        h: 32,
        vx: -cfg.enemyBaseSpeed,
        vy: 0,
        type,
        isSquished: false,
        squishTimer: 0,
        isDead: false,
      });
    }

    // Sacred Temple Goal & Maha Ghanti Bell Tower
    const stambhaX = levelWidth - 360;
    const templeX = levelWidth - 250;
    const templeGoal: TempleGoal = {
      stambhaX,
      stambhaY: 120,
      stambhaH: 260,
      bellX: stambhaX + 24,
      bellY: 150,
      bellSwing: 0,
      bellSwingVel: 0,
      isRung: false,
      templeX,
      templeY: groundY,
      templeW: 240,
      templeH: 260,
    };

    const flagpole = { x: templeGoal.bellX, y: 110, h: 270, flagY: 120, reached: false };
    const templeSanctum = { x: templeX, y: 140, w: 240, h: 240 };

    return { blocks, floatingModaks, enemies, templeGoal, flagpole, templeSanctum, levelWidth };
  }, []);

  // Initialize or Restart Level
  const startLevel = useCallback((stageNum: number, keepScore = false) => {
    const { blocks, floatingModaks, enemies, templeGoal, flagpole, templeSanctum, levelWidth } = buildLevel(stageNum);
    const eng = engineRef.current;

    eng.levelWidth = levelWidth;
    eng.player = {
      x: 80,
      y: 280,
      w: 34,
      h: 36,
      vx: 0,
      vy: 0,
      isGrounded: false,
      facing: 'right',
      isSuper: false,
      canDoubleJump: true,
      invulnerableTimer: 0,
      runAnimFrame: 0,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      hasTrishul: false,
      hasLotusGlide: false,
      shieldCharges: 0,
      isGliding: false,
      zapCooldown: 0,
      lotusTimer: 0,
      trishulTimer: 0,
      superTimer: 0,
      shieldTimer: 0,
    };
    eng.cameraX = 0;
    eng.blocks = blocks;
    eng.floatingModaks = floatingModaks;
    eng.superItems = [];
    eng.thunderSparks = [];
    eng.enemies = enemies;
    eng.particles = [];
    eng.fireworkRockets = [];
    eng.fireworkSparks = [];
    eng.skyFlashAlpha = 0;
    eng.fireworkTimer = 0.5;
    eng.scorePopups = [];
    eng.expandingRings = [];
    eng.templeGoal = templeGoal;
    eng.flagpole = flagpole;
    eng.templeSanctum = templeSanctum;
    eng.timeRemaining = 360;
    eng.isClearing = false;
    eng.clearTimer = 0;
    eng.isDeadAnim = false;
    eng.deadTimer = 0;
    eng.gameTime = 0;

    if (!keepScore) {
      eng.score = 0;
      eng.modaks = 0;
      eng.lives = 3;
      setScore(0);
      setModaks(0);
      setLives(3);
    }

    setHasTrishul(false);
    setHasLotusGlide(false);
    setShieldCharges(0);
    setIsSuper(false);
    setLotusTimerSec(0);
    setTrishulTimerSec(0);
    setSuperTimerSec(0);
    setShieldTimerSec(0);
    setStage(stageNum);
    setTimeLeft(360);
    setDistanceMeters(0);
    setScoreSaved(false);
    setGameState('playing');
    soundEngine.playShankh();
  }, [buildLevel]);

  // Handle Player Death
  const handlePlayerDeath = useCallback(() => {
    const eng = engineRef.current;
    if (eng.isDeadAnim) return;

    soundEngine.playSlip();
    eng.isDeadAnim = true;
    eng.deadTimer = 2.0;
    eng.player.vy = -560; // High pop up and fall
    eng.lives -= 1;
    setLives(eng.lives);

    eng.player.hasTrishul = false;
    eng.player.hasLotusGlide = false;
    eng.player.shieldCharges = 0;
    eng.player.isSuper = false;
    eng.player.isGliding = false;
    eng.player.lotusTimer = 0;
    eng.player.trishulTimer = 0;
    eng.player.superTimer = 0;
    eng.player.shieldTimer = 0;
    setHasTrishul(false);
    setHasLotusGlide(false);
    setShieldCharges(0);
    setIsSuper(false);
    setLotusTimerSec(0);
    setTrishulTimerSec(0);
    setSuperTimerSec(0);
    setShieldTimerSec(0);

    if (eng.lives <= 0) {
      setTimeout(() => {
        setGameState('game_over');
        soundEngine.playShankh();
      }, 1900);
    } else {
      setTimeout(() => {
        eng.player.x = Math.max(80, eng.cameraX + 60);
        eng.player.y = 220;
        eng.player.vx = 0;
        eng.player.vy = 0;
        eng.player.invulnerableTimer = 2.5;
        eng.isDeadAnim = false;
      }, 1900);
    }
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'p', 'x', 'X', 'Shift'].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowLeft' || e.key === 'a') keysRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') keysRef.current.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') {
        if (!keysRef.current.jump) {
          keysRef.current.jumpPressedThisFrame = true;
        }
        keysRef.current.jump = true;
      }
      if (e.key === 'x' || e.key === 'X' || e.key === 'Shift' || e.key === 'f') {
        if (!keysRef.current.action) {
          keysRef.current.actionPressedThisFrame = true;
        }
        keysRef.current.action = true;
      }
      if (e.key === 'p') {
        setGameState((prev) => (prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keysRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') keysRef.current.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') {
        keysRef.current.jump = false;
      }
      if (e.key === 'x' || e.key === 'X' || e.key === 'Shift' || e.key === 'f') {
        keysRef.current.action = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main 60fps Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const eng = engineRef.current;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;
      eng.gameTime += dt;

      const p = eng.player;
      const keys = keysRef.current;

      setDistanceMeters(Math.floor(p.x / 10));

      // 1. Time Countdown & Power-Up Duration Engine
      if (!eng.isClearing && !eng.isDeadAnim) {
        eng.timeRemaining -= dt * 0.4;
        setTimeLeft(Math.max(0, Math.ceil(eng.timeRemaining)));
        if (eng.timeRemaining <= 0) {
          handlePlayerDeath();
        }

        // --- Active Ability Timers with Real-Time Expiration ---
        // 1. Lotus Glide Duration
        if (p.hasLotusGlide) {
          p.lotusTimer -= dt;
          if (p.lotusTimer <= 0) {
            p.hasLotusGlide = false;
            p.lotusTimer = 0;
            p.isGliding = false;
            setHasLotusGlide(false);
            setLotusTimerSec(0);
            soundEngine.playPowerExpired();
            eng.scorePopups.push({
              id: Math.random(),
              x: p.x + p.w / 2,
              y: p.y - 16,
              text: '🪷 Lotus Glide Expired',
              alpha: 1,
              color: '#FDA4AF',
            });
          } else {
            setLotusTimerSec(Math.ceil(p.lotusTimer));
          }
        }

        // 2. Thunder Trishul Zap Duration
        if (p.hasTrishul) {
          p.trishulTimer -= dt;
          if (p.trishulTimer <= 0) {
            p.hasTrishul = false;
            p.trishulTimer = 0;
            setHasTrishul(false);
            setTrishulTimerSec(0);
            soundEngine.playPowerExpired();
            eng.scorePopups.push({
              id: Math.random(),
              x: p.x + p.w / 2,
              y: p.y - 16,
              text: '⚡ Trishul Zap Expired',
              alpha: 1,
              color: '#38BDF8',
            });
          } else {
            setTrishulTimerSec(Math.ceil(p.trishulTimer));
          }
        }

        // 3. Super Amrit Duration
        if (p.isSuper) {
          p.superTimer -= dt;
          if (p.superTimer <= 0) {
            p.isSuper = false;
            p.superTimer = 0;
            p.h = 36;
            setIsSuper(false);
            setSuperTimerSec(0);
            soundEngine.playPowerExpired();
            eng.scorePopups.push({
              id: Math.random(),
              x: p.x + p.w / 2,
              y: p.y - 16,
              text: '💎 Super Amrit Expired',
              alpha: 1,
              color: '#FBBF24',
            });
          } else {
            setSuperTimerSec(Math.ceil(p.superTimer));
          }
        }

        // 4. Kavach Shield Duration
        if (p.shieldCharges > 0) {
          p.shieldTimer -= dt;
          if (p.shieldTimer <= 0) {
            p.shieldCharges = 0;
            p.shieldTimer = 0;
            setShieldCharges(0);
            setShieldTimerSec(0);
            soundEngine.playPowerExpired();
            eng.scorePopups.push({
              id: Math.random(),
              x: p.x + p.w / 2,
              y: p.y - 16,
              text: '🛡️ Shield Expired',
              alpha: 1,
              color: '#34D399',
            });
          } else {
            setShieldTimerSec(Math.ceil(p.shieldTimer));
          }
        }
      }

      // 2. Continuous Fireworks Engine
      eng.fireworkTimer -= dt;
      if (eng.fireworkTimer <= 0) {
        eng.fireworkTimer = 0.9 + Math.random() * 1.1;
        const fireColors = ['#F59E0B', '#EF4444', '#10B981', '#38BDF8', '#EC4899', '#A855F7', '#FDE047'];
        eng.fireworkRockets.push({
          x: eng.cameraX + 80 + Math.random() * 640,
          y: 440,
          targetY: 60 + Math.random() * 130,
          vy: -480 - Math.random() * 120,
          color: fireColors[Math.floor(Math.random() * fireColors.length)],
        });
      }

      // Update rockets
      eng.fireworkRockets.forEach((r) => {
        r.y += r.vy * dt;
        // Rocket spark trail
        eng.fireworkSparks.push({
          x: r.x,
          y: r.y,
          vx: (Math.random() - 0.5) * 20,
          vy: 60 + Math.random() * 40,
          color: '#FDE047',
          alpha: 0.8,
          life: 0.25,
          size: 2,
        });

        // Explode
        if (r.y <= r.targetY) {
          eng.skyFlashAlpha = 0.24;
          soundEngine.playFireworkBurst();

          // Burst into 32 multi-colored glowing sparks
          for (let i = 0; i < 32; i++) {
            const angle = (i / 32) * Math.PI * 2;
            const speed = 70 + Math.random() * 110;
            eng.fireworkSparks.push({
              x: r.x,
              y: r.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              color: r.color,
              alpha: 1,
              life: 0.8 + Math.random() * 0.4,
              size: 3.2,
            });
          }
        }
      });
      eng.fireworkRockets = eng.fireworkRockets.filter((r) => r.y > r.targetY);

      // Update firework sparks
      eng.fireworkSparks.forEach((sp) => {
        sp.x += sp.vx * dt;
        sp.vy += 160 * dt;
        sp.y += sp.vy * dt;
        sp.alpha -= (1 / sp.life) * dt;
      });
      eng.fireworkSparks = eng.fireworkSparks.filter((sp) => sp.alpha > 0);

      // Fade sky flash
      if (eng.skyFlashAlpha > 0) {
        eng.skyFlashAlpha = Math.max(0, eng.skyFlashAlpha - dt * 1.8);
      }

      // 3. Dead Animation
      if (eng.isDeadAnim) {
        p.vy += 1200 * dt;
        p.y += p.vy * dt;
      } else if (eng.isClearing) {
        // Swing the Maha Ghanti Bell and walk up temple steps into sanctum
        eng.clearTimer += dt;
        const tg = eng.templeGoal;

        // Realistic pendulum swing physics for the bell
        tg.bellSwingVel += -tg.bellSwing * 18 * dt;
        tg.bellSwing += tg.bellSwingVel * dt;
        tg.bellSwingVel *= 0.95;

        // Continuous shower of festive marigold flower petals
        if (Math.random() < 0.4) {
          eng.particles.push({
            x: tg.templeX - 40 + Math.random() * (tg.templeW + 80),
            y: 60 + Math.random() * 40,
            vx: (Math.random() - 0.5) * 40,
            vy: 50 + Math.random() * 60,
            color: Math.random() < 0.4 ? '#F97316' : Math.random() < 0.7 ? '#FBBF24' : '#FB7185',
            size: 4.5,
            alpha: 1,
            life: 2.2,
            isPetal: true,
          });
        }

        // Mushak gracefully lands, then walks up the temple steps into the Garbhagriha
        if (p.y < 380 - p.h) {
          p.vy += 800 * dt;
          p.y += p.vy * dt;
          if (p.y >= 380 - p.h) {
            p.y = 380 - p.h;
            p.vy = 0;
          }
        }
        p.x += 120 * dt;
        p.facing = 'right';

        if (p.x >= tg.templeX + 80) {
          setGameState('stage_clear');
          soundEngine.playLevelClear();
          confetti({ particleCount: 160, spread: 100, origin: { y: 0.5 } });
        }
      } else {
        // 4. PLAYER MOVEMENT & DIVINE DOUBLE JUMP
        const baseSpeed = p.isSuper ? 280 : 210;
        const accel = 640;
        const friction = 720;

        if (keys.left) {
          p.vx = Math.max(-baseSpeed, p.vx - accel * dt);
          p.facing = 'left';
        } else if (keys.right) {
          p.vx = Math.min(baseSpeed, p.vx + accel * dt);
          p.facing = 'right';
        } else {
          if (p.vx > 0) p.vx = Math.max(0, p.vx - friction * dt);
          else if (p.vx < 0) p.vx = Math.min(0, p.vx + friction * dt);
        }

        // Coyote Time & Jump Buffer
        if (p.isGrounded) {
          p.coyoteTimer = 0.12;
          p.canDoubleJump = true;
        } else {
          p.coyoteTimer = Math.max(0, p.coyoteTimer - dt);
        }

        if (keys.jumpPressedThisFrame) {
          p.jumpBufferTimer = 0.14;
        } else {
          p.jumpBufferTimer = Math.max(0, p.jumpBufferTimer - dt);
        }

        // Ground Jump
        const jumpForce = p.isSuper ? -680 : -640;
        if (p.jumpBufferTimer > 0 && p.coyoteTimer > 0) {
          p.vy = jumpForce;
          p.isGrounded = false;
          p.coyoteTimer = 0;
          p.jumpBufferTimer = 0;
          soundEngine.playJump();

          for (let i = 0; i < 6; i++) {
            eng.particles.push({
              x: p.x + p.w / 2,
              y: p.y + p.h,
              vx: (Math.random() - 0.5) * 120,
              vy: -Math.random() * 60,
              color: '#F59E0B',
              size: 3.5,
              alpha: 0.8,
              life: 0.4,
            });
          }
        }
        // Divine Mid-Air Double Jump
        else if (keys.jumpPressedThisFrame && !p.isGrounded && p.canDoubleJump) {
          p.vy = -580;
          p.canDoubleJump = false;
          p.jumpBufferTimer = 0;
          soundEngine.playDoubleJump();

          // Shower of Pink Lotus Petals & Gold Stars
          for (let i = 0; i < 14; i++) {
            const angle = (i / 14) * Math.PI * 2;
            const speed = 70 + Math.random() * 90;
            eng.particles.push({
              x: p.x + p.w / 2,
              y: p.y + p.h - 4,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed * 0.6 + 40,
              color: i % 2 === 0 ? '#FDA4AF' : '#FDE047',
              size: 4.5,
              alpha: 1,
              life: 0.6,
              isPetal: i % 2 === 0,
            });
          }
        }

        keys.jumpPressedThisFrame = false;

        // Lotus Glide Ability: Holding jump while falling in mid-air
        if (p.hasLotusGlide && p.lotusTimer > 0 && !p.isGrounded && keys.jump && p.vy > 20 && !eng.isClearing && !eng.isDeadAnim) {
          p.vy = 40; // Soft divine float descent
          p.isGliding = true;
          if (Math.random() < 0.3) {
            eng.particles.push({
              x: p.x + p.w / 2 + (Math.random() - 0.5) * 16,
              y: p.y + p.h - 2,
              vx: (Math.random() - 0.5) * 35,
              vy: Math.random() * 20 + 15,
              color: '#FDA4AF',
              size: 4,
              alpha: 0.9,
              life: 0.5,
              isPetal: true,
            });
          }
        } else {
          p.isGliding = false;
        }

        // Thunder Trishul Zap Action (Key X / Shift / Zap button)
        if (keys.actionPressedThisFrame || (keys.action && p.zapCooldown <= 0)) {
          keys.actionPressedThisFrame = false;
          if (p.hasTrishul && p.zapCooldown <= 0) {
            p.zapCooldown = 0.32;
            soundEngine.playThunderZap();

            const dir = p.facing === 'left' ? -1 : 1;
            eng.thunderSparks.push({
              id: Math.random(),
              x: p.x + (dir === 1 ? p.w + 6 : -14),
              y: p.y + p.h / 2 - 2,
              vx: dir * 580,
              vy: 0,
              life: 1.2,
            });

            // Electric muzzle flash sparks
            for (let i = 0; i < 8; i++) {
              eng.particles.push({
                x: p.x + (dir === 1 ? p.w : 0),
                y: p.y + p.h / 2,
                vx: dir * (90 + Math.random() * 120),
                vy: (Math.random() - 0.5) * 90,
                color: i % 2 === 0 ? '#38BDF8' : '#FDE047',
                size: 3.5,
                alpha: 1,
                life: 0.25,
              });
            }
          }
        }
        if (p.zapCooldown > 0) p.zapCooldown -= dt;

        // Gravity
        p.vy += 1260 * dt;

        if (p.invulnerableTimer > 0) p.invulnerableTimer -= dt;
        p.h = p.isSuper ? 44 : 36;

        if (Math.abs(p.vx) > 10 && p.isGrounded) {
          p.runAnimFrame += dt * 14;
        }

        // Horizontal Collision
        p.x += p.vx * dt;
        if (p.x < eng.cameraX) p.x = eng.cameraX;

        eng.blocks.forEach((b) => {
          if (
            p.x < b.x + b.w &&
            p.x + p.w > b.x &&
            p.y < b.y + b.h &&
            p.y + p.h > b.y
          ) {
            if (p.vx > 0) {
              p.x = b.x - p.w;
              p.vx = 0;
            } else if (p.vx < 0) {
              p.x = b.x + b.w;
              p.vx = 0;
            }
          }
        });

        // Vertical Collision
        p.y += p.vy * dt;
        p.isGrounded = false;

        eng.blocks.forEach((b) => {
          if (
            p.x < b.x + b.w &&
            p.x + p.w > b.x &&
            p.y < b.y + b.h &&
            p.y + p.h > b.y
          ) {
            // Landing on top
            if (p.vy > 0 && p.y + p.h - p.vy * dt <= b.y + 14) {
              p.y = b.y - p.h;
              p.vy = 0;
              p.isGrounded = true;
            }
            // Head bump from below
            else if (p.vy < 0 && p.y - p.vy * dt >= b.y + b.h - 14) {
              p.y = b.y + b.h;
              p.vy = 0;

              if (b.type !== 'ground' && b.type !== 'pedestal') {
                b.bumpY = -12;
                soundEngine.playBlockBump();

                if (b.type === 'question_modak') {
                  b.type = 'empty';
                  eng.modaks += 1;
                  eng.score += 200;
                  setModaks(eng.modaks);
                  setScore(eng.score);
                  soundEngine.playCollect(true);

                  eng.scorePopups.push({
                    id: Math.random(),
                    x: b.x + b.w / 2,
                    y: b.y - 15,
                    text: '+200',
                    alpha: 1,
                    color: '#FDE047',
                  });
                  eng.expandingRings.push({
                    id: Math.random(),
                    x: b.x + b.w / 2,
                    y: b.y - 10,
                    radius: 8,
                    maxRadius: 40,
                    color: '#F59E0B',
                    alpha: 1,
                  });
                } else if (b.type === 'question_super') {
                  b.type = 'empty';
                  soundEngine.playPowerupSprout();

                  const itemTypes: PowerItemType[] = ['trishul', 'lotus', 'shield', 'super_modak'];
                  const chosenType = itemTypes[Math.floor(Math.random() * itemTypes.length)];

                  eng.superItems.push({
                    id: Math.random(),
                    x: b.x + 4,
                    y: b.y - 32,
                    w: 30,
                    h: 30,
                    vx: 75,
                    vy: -160,
                    type: chosenType,
                    collected: false,
                  });
                } else if (b.type === 'brick') {
                  if (p.isSuper) {
                    b.isHit = true;
                    eng.score += 50;
                    setScore(eng.score);
                    soundEngine.playDholBass();
                    for (let i = 0; i < 8; i++) {
                      eng.particles.push({
                        x: b.x + b.w / 2,
                        y: b.y + b.h / 2,
                        vx: (Math.random() - 0.5) * 240,
                        vy: -Math.random() * 280,
                        color: '#9A3412',
                        size: 6,
                        alpha: 1,
                        life: 0.5,
                      });
                    }
                  }
                }
              }
            }
          }
        });

        // Filter shattered bricks
        eng.blocks = eng.blocks.filter((b) => !b.isHit);

        // Fall into open temple water canal
        if (p.y > 480) {
          handlePlayerDeath();
        }

        // Sacred Maha Ghanti Bell Pillar Reached Detection
        const tg = eng.templeGoal;
        if (
          !tg.isRung &&
          p.x + p.w >= tg.stambhaX - 10 &&
          p.x <= tg.stambhaX + 40 &&
          p.y + p.h >= tg.stambhaY
        ) {
          tg.isRung = true;
          tg.bellSwingVel = 7.0; // Trigger vigorous resonant bell swing!
          eng.flagpole.reached = true;
          eng.isClearing = true;
          p.vx = 0;
          p.vy = 0;
          p.isGliding = false;
          p.hasLotusGlide = false;
          p.lotusTimer = 0;
          p.hasTrishul = false;
          p.trishulTimer = 0;
          p.isSuper = false;
          p.superTimer = 0;
          p.shieldCharges = 0;
          p.shieldTimer = 0;
          setHasLotusGlide(false);
          setHasTrishul(false);
          setIsSuper(false);
          setShieldCharges(0);
          setLotusTimerSec(0);
          setTrishulTimerSec(0);
          setSuperTimerSec(0);
          setShieldTimerSec(0);
          soundEngine.playTempleBell();
          soundEngine.playDholBass();

          // Golden acoustic expanding rings radiating from bell
          for (let i = 0; i < 3; i++) {
            eng.expandingRings.push({
              id: Math.random(),
              x: tg.bellX,
              y: tg.bellY + 20,
              radius: 10 + i * 14,
              maxRadius: 75 + i * 25,
              color: '#FDE047',
              alpha: 0.95,
            });
          }

          // Initial joyful shower of flower petals
          for (let i = 0; i < 22; i++) {
            const ang = Math.random() * Math.PI * 2;
            const spd = 40 + Math.random() * 80;
            eng.particles.push({
              x: tg.bellX,
              y: tg.bellY + 20,
              vx: Math.cos(ang) * spd,
              vy: Math.sin(ang) * spd - 30,
              color: i % 2 === 0 ? '#F97316' : '#FBBF24',
              size: 4 + Math.random() * 3,
              alpha: 1,
              life: 1.8,
              isPetal: true,
            });
          }

          const clearBonus = Math.max(500, Math.floor((380 - p.y) * 15));
          eng.score += clearBonus;
          setScore(eng.score);
          eng.scorePopups.push({
            id: Math.random(),
            x: tg.bellX,
            y: tg.bellY - 20,
            text: `🔔 MAHA GHANTI RUNG! +${clearBonus}`,
            alpha: 1,
            color: '#FDE047',
          });
        }

        // Camera follow
        const targetCamX = p.x - 220;
        if (targetCamX > eng.cameraX) {
          eng.cameraX += (targetCamX - eng.cameraX) * 12 * dt;
        }
      }

      // Smooth Block Bump return
      eng.blocks.forEach((b) => {
        if (b.bumpY < 0) {
          b.bumpY = Math.min(0, b.bumpY + 60 * dt);
        }
      });

      // 5. FLOATING MODAKS & RARE POWERS
      eng.floatingModaks.forEach((m) => {
        if (m.collected) return;
        m.y = m.baseY + Math.sin(eng.gameTime * 3.2 + m.id) * 6;

        // Subtle sparkling particles from luminous modaks
        if (Math.random() < 0.05) {
          eng.particles.push({
            x: m.x + m.w / 2 + (Math.random() - 0.5) * 16,
            y: m.y + m.h / 2 + (Math.random() - 0.5) * 16,
            vx: (Math.random() - 0.5) * 20,
            vy: -Math.random() * 25 - 5,
            color:
              m.type === 'rare_trishul'
                ? '#38BDF8'
                : m.type === 'rare_lotus'
                ? '#FDA4AF'
                : m.type === 'rare_shield'
                ? '#34D399'
                : m.type === 'rare_amrit'
                ? '#FBBF24'
                : '#FDE047',
            size: 2.8,
            alpha: 0.85,
            life: 0.45,
          });
        }

        if (
          p.x < m.x + m.w &&
          p.x + p.w > m.x &&
          p.y < m.y + m.h &&
          p.y + p.h > m.y
        ) {
          m.collected = true;
          eng.modaks += 1;
          setModaks(eng.modaks);

          let popupText = '+200';
          let popupColor = '#FDE047';
          let ringColor = '#F59E0B';

          if (m.type === 'rare_trishul') {
            p.hasTrishul = true;
            p.trishulTimer = 18.0;
            setHasTrishul(true);
            setTrishulTimerSec(18);
            eng.score += 500;
            popupText = '⚡ TRISHUL ZAP (18s)!';
            popupColor = '#38BDF8';
            ringColor = '#0284C7';
            soundEngine.playThunderZap();
          } else if (m.type === 'rare_lotus') {
            p.hasLotusGlide = true;
            p.lotusTimer = 16.0;
            setHasLotusGlide(true);
            setLotusTimerSec(16);
            eng.score += 500;
            popupText = '🪷 LOTUS GLIDE (16s)!';
            popupColor = '#FDA4AF';
            ringColor = '#F43F5E';
            soundEngine.playLotusGlide();
          } else if (m.type === 'rare_shield') {
            p.shieldCharges = Math.min(3, p.shieldCharges + 3);
            p.shieldTimer = 22.0;
            setShieldCharges(p.shieldCharges);
            setShieldTimerSec(22);
            eng.score += 500;
            popupText = '🛡️ KAVACH SHIELD (22s)!';
            popupColor = '#34D399';
            ringColor = '#059669';
            soundEngine.playShieldActivate();
          } else if (m.type === 'rare_amrit') {
            p.isSuper = true;
            p.superTimer = 20.0;
            p.h = 48; // Super size
            setIsSuper(true);
            setSuperTimerSec(20);
            eng.score += 1000;
            popupText = '💎 AMRIT SUPER (20s)!';
            popupColor = '#FBBF24';
            ringColor = '#D97706';
            soundEngine.playPowerup();
          } else {
            eng.score += 200;
            soundEngine.playCollect(true);
          }
          setScore(eng.score);

          eng.expandingRings.push({
            id: Math.random(),
            x: m.x + m.w / 2,
            y: m.y + m.h / 2,
            radius: 6,
            maxRadius: 48,
            color: ringColor,
            alpha: 1,
          });

          eng.scorePopups.push({
            id: Math.random(),
            x: m.x + m.w / 2,
            y: m.y - 14,
            text: popupText,
            alpha: 1,
            color: popupColor,
          });

          for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const speed = 70 + Math.random() * 90;
            eng.particles.push({
              x: m.x + m.w / 2,
              y: m.y + m.h / 2,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 20,
              color: i % 2 === 0 ? popupColor : '#FFFFFF',
              size: 4,
              alpha: 1,
              life: 0.55,
            });
          }
        }
      });
      eng.floatingModaks = eng.floatingModaks.filter((m) => !m.collected);

      // 6. POWER ITEMS (sprouted from Question Blocks)
      eng.superItems.forEach((item) => {
        item.vy += 1000 * dt;
        item.y += item.vy * dt;
        item.x += item.vx * dt;

        eng.blocks.forEach((b) => {
          if (
            item.x < b.x + b.w &&
            item.x + item.w > b.x &&
            item.y < b.y + b.h &&
            item.y + item.h > b.y
          ) {
            if (item.vy > 0) {
              item.y = b.y - item.h;
              item.vy = 0;
            } else if (item.vx > 0) {
              item.vx = -Math.abs(item.vx);
            } else if (item.vx < 0) {
              item.vx = Math.abs(item.vx);
            }
          }
        });

        if (
          !item.collected &&
          p.x < item.x + item.w &&
          p.x + p.w > item.x &&
          p.y < item.y + item.h &&
          p.y + p.h > item.y
        ) {
          item.collected = true;
          let popupText = 'POWER UP!';
          let popupColor = '#FBBF24';

          if (item.type === 'trishul') {
            p.hasTrishul = true;
            p.trishulTimer = 18.0;
            setHasTrishul(true);
            setTrishulTimerSec(18);
            eng.score += 800;
            popupText = '⚡ THUNDER TRISHUL (18s)!';
            popupColor = '#38BDF8';
            soundEngine.playThunderZap();
          } else if (item.type === 'lotus') {
            p.hasLotusGlide = true;
            p.lotusTimer = 16.0;
            setHasLotusGlide(true);
            setLotusTimerSec(16);
            eng.score += 800;
            popupText = '🪷 LOTUS GLIDE (16s)!';
            popupColor = '#FDA4AF';
            soundEngine.playLotusGlide();
          } else if (item.type === 'shield') {
            p.shieldCharges = Math.min(3, p.shieldCharges + 3);
            p.shieldTimer = 22.0;
            setShieldCharges(p.shieldCharges);
            setShieldTimerSec(22);
            eng.score += 800;
            popupText = '🛡️ KAVACH SHIELD (22s)!';
            popupColor = '#34D399';
            soundEngine.playShieldActivate();
          } else {
            p.isSuper = true;
            p.superTimer = 20.0;
            p.h = 48; // Super size
            setIsSuper(true);
            setSuperTimerSec(20);
            eng.score += 1000;
            popupText = '💎 AMRIT SUPER (20s)!';
            popupColor = '#FBBF24';
            soundEngine.playPowerup();
          }
          setScore(eng.score);

          eng.scorePopups.push({
            id: Math.random(),
            x: item.x + item.w / 2,
            y: item.y - 15,
            text: popupText,
            alpha: 1,
            color: popupColor,
          });

          eng.expandingRings.push({
            id: Math.random(),
            x: item.x + item.w / 2,
            y: item.y + item.h / 2,
            radius: 8,
            maxRadius: 50,
            color: popupColor,
            alpha: 1,
          });
        }
      });
      eng.superItems = eng.superItems.filter((it) => !it.collected);

      // 6.5 THUNDER SPARKS UPDATE & ENEMY COLLISION
      eng.thunderSparks.forEach((ts) => {
        ts.x += ts.vx * dt;
        ts.life -= dt;

        // Electric projectile spark trail
        if (Math.random() < 0.6) {
          eng.particles.push({
            x: ts.x,
            y: ts.y + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 30,
            vy: (Math.random() - 0.5) * 30,
            color: Math.random() < 0.5 ? '#38BDF8' : '#FDE047',
            size: 3,
            alpha: 0.9,
            life: 0.22,
          });
        }

        // Check hitting enemies
        eng.enemies.forEach((enemy) => {
          if (!enemy.isDead && !enemy.isSquished) {
            if (
              ts.x > enemy.x &&
              ts.x < enemy.x + enemy.w &&
              ts.y > enemy.y &&
              ts.y < enemy.y + enemy.h
            ) {
              enemy.isDead = true;
              ts.life = 0;
              soundEngine.playFireball();

              for (let i = 0; i < 18; i++) {
                const ang = (i / 18) * Math.PI * 2;
                eng.particles.push({
                  x: enemy.x + enemy.w / 2,
                  y: enemy.y + enemy.h / 2,
                  vx: Math.cos(ang) * 160,
                  vy: Math.sin(ang) * 160,
                  color: i % 2 === 0 ? '#38BDF8' : '#FDE047',
                  size: 4,
                  alpha: 1,
                  life: 0.45,
                });
              }
              eng.expandingRings.push({
                id: Math.random(),
                x: enemy.x + enemy.w / 2,
                y: enemy.y + enemy.h / 2,
                radius: 8,
                maxRadius: 45,
                color: '#38BDF8',
                alpha: 1,
              });
              eng.scorePopups.push({
                id: Math.random(),
                x: enemy.x + enemy.w / 2,
                y: enemy.y - 12,
                text: '⚡ THUNDER ZAP! +300',
                alpha: 1,
                color: '#38BDF8',
              });
              eng.score += 300;
              setScore(eng.score);
            }
          }
        });

        // Hit solid block
        eng.blocks.forEach((b) => {
          if (b.type !== 'empty' && ts.x > b.x && ts.x < b.x + b.w && ts.y > b.y && ts.y < b.y + b.h) {
            ts.life = 0;
          }
        });
      });
      eng.thunderSparks = eng.thunderSparks.filter((ts) => ts.life > 0);

      // 7. ENEMIES (With Sudarshan Shield & Super Rush)
      eng.enemies.forEach((enemy) => {
        if (enemy.isSquished) {
          enemy.squishTimer -= dt;
          if (enemy.squishTimer <= 0) enemy.isDead = true;
          return;
        }

        if (enemy.x > eng.cameraX - 100 && enemy.x < eng.cameraX + 850) {
          enemy.vy += 1000 * dt;
          enemy.y += enemy.vy * dt;
          enemy.x += enemy.vx * dt;

          eng.blocks.forEach((b) => {
            if (
              enemy.x < b.x + b.w &&
              enemy.x + enemy.w > b.x &&
              enemy.y < b.y + b.h &&
              enemy.y + enemy.h > b.y
            ) {
              if (enemy.vy > 0) {
                enemy.y = b.y - enemy.h;
                enemy.vy = 0;
              } else if (enemy.vx > 0) {
                enemy.vx = -Math.abs(enemy.vx);
              } else if (enemy.vx < 0) {
                enemy.vx = Math.abs(enemy.vx);
              }
            }
          });

          // Player vs Enemy
          if (
            !eng.isDeadAnim &&
            !eng.isClearing &&
            p.x < enemy.x + enemy.w &&
            p.x + p.w > enemy.x &&
            p.y < enemy.y + enemy.h &&
            p.y + p.h > enemy.y
          ) {
            // Jump Stomp
            if (p.vy > 0 && p.y + p.h - p.vy * dt <= enemy.y + 14) {
              enemy.isSquished = true;
              enemy.squishTimer = 0.4;
              p.vy = -380;
              soundEngine.playStomp();
              eng.score += 200;
              setScore(eng.score);
            } else if (p.shieldCharges > 0 && p.invulnerableTimer <= 0) {
              // Divine Kavach Shield Absorbs Attack!
              p.shieldCharges -= 1;
              setShieldCharges(p.shieldCharges);
              enemy.isDead = true;
              p.invulnerableTimer = 1.0;
              soundEngine.playShieldActivate();

              eng.scorePopups.push({
                id: Math.random(),
                x: enemy.x + enemy.w / 2,
                y: enemy.y - 15,
                text: '🛡️ CHAKRA DEFLECT! +300',
                alpha: 1,
                color: '#34D399',
              });
              eng.expandingRings.push({
                id: Math.random(),
                x: enemy.x + enemy.w / 2,
                y: enemy.y + enemy.h / 2,
                radius: 12,
                maxRadius: 55,
                color: '#34D399',
                alpha: 1,
              });
              for (let i = 0; i < 16; i++) {
                const ang = (i / 16) * Math.PI * 2;
                eng.particles.push({
                  x: enemy.x + enemy.w / 2,
                  y: enemy.y + enemy.h / 2,
                  vx: Math.cos(ang) * 150,
                  vy: Math.sin(ang) * 150,
                  color: '#34D399',
                  size: 4,
                  alpha: 1,
                  life: 0.4,
                });
              }
              eng.score += 300;
              setScore(eng.score);
            } else if (p.isSuper) {
              // Super Mushak running through enemy
              enemy.isDead = true;
              soundEngine.playStomp();
              eng.score += 250;
              setScore(eng.score);
              eng.scorePopups.push({
                id: Math.random(),
                x: enemy.x + enemy.w / 2,
                y: enemy.y - 12,
                text: 'SMASH! +250',
                alpha: 1,
                color: '#FBBF24',
              });
            } else {
              if (p.invulnerableTimer <= 0) {
                handlePlayerDeath();
              }
            }
          }
        }
      });
      eng.enemies = eng.enemies.filter((e) => !e.isDead);

      // 8. PARTICLES & POPUPS
      eng.particles.forEach((pt) => {
        pt.x += pt.vx * dt;
        pt.vy += 450 * dt;
        pt.y += pt.vy * dt;
        pt.alpha -= (1 / pt.life) * dt;
      });
      eng.particles = eng.particles.filter((pt) => pt.alpha > 0);

      eng.expandingRings.forEach((rg) => {
        rg.radius += 90 * dt;
        rg.alpha -= dt * 2.2;
      });
      eng.expandingRings = eng.expandingRings.filter((rg) => rg.alpha > 0);

      eng.scorePopups.forEach((sp) => {
        sp.y -= 45 * dt;
        sp.alpha -= dt * 1.4;
      });
      eng.scorePopups = eng.scorePopups.filter((sp) => sp.alpha > 0);

      // ==========================================
      // 9. RENDERING (DEEP CELESTIAL SKY & GANESH)
      // ==========================================
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Stage-specific Celestial Sky Gradient
      const curStageCfg = STAGE_CONFIGS[Math.max(0, Math.min(STAGE_CONFIGS.length - 1, stage - 1))];
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, curStageCfg.skyTop);
      skyGrad.addColorStop(0.5, curStageCfg.skyMid);
      skyGrad.addColorStop(1, curStageCfg.skyBottom);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Firework illumination sky flash
      if (eng.skyFlashAlpha > 0) {
        ctx.fillStyle = `rgba(253, 230, 138, ${eng.skyFlashAlpha})`;
        ctx.fillRect(0, 0, w, h);
      }

      // Twinkling stars in sky
      ctx.fillStyle = '#FFFFFF';
      for (let s = 0; s < 45; s++) {
        const sx = (s * 87) % w;
        const sy = (s * 41) % 220;
        const alpha = 0.3 + 0.7 * Math.abs(Math.sin(eng.gameTime * 2 + s));
        ctx.globalAlpha = alpha;
        ctx.fillRect(sx, sy, s % 3 === 0 ? 2 : 1.5, s % 3 === 0 ? 2 : 1.5);
      }
      ctx.globalAlpha = 1;

      // Distant Temple Spire Horizon Silhouette
      ctx.save();
      ctx.fillStyle = 'rgba(12, 10, 32, 0.6)';
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let hx = 0; hx <= w; hx += 70) {
        const hy = 280 + Math.sin((hx + eng.cameraX * 0.08) * 0.018) * 28;
        ctx.lineTo(hx, hy);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // --- CELESTIAL LORD GANESHA PORTRAIT IN THE SKY ---
      ctx.save();
      const gx = w / 2 - ((eng.cameraX * 0.04) % 80);
      const gy = 125 + Math.sin(eng.gameTime * 0.8) * 3;
      const gScale = 0.82;

      ctx.translate(gx, gy);
      ctx.scale(gScale, gScale);

      // Radiant Golden Prabhavali (Halo)
      const haloGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 95);
      haloGrad.addColorStop(0, 'rgba(251, 191, 36, 0.25)');
      haloGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.12)');
      haloGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 95, 0, Math.PI * 2);
      ctx.fill();

      // Radiating Rays of Light
      ctx.strokeStyle = 'rgba(253, 230, 138, 0.22)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 24; i++) {
        const ang = (i / 24) * Math.PI * 2 + eng.gameTime * 0.1;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * 55, Math.sin(ang) * 55);
        ctx.lineTo(Math.cos(ang) * 85, Math.sin(ang) * 85);
        ctx.stroke();
      }

      // Concentric Halo Ring
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, 52, 0, Math.PI * 2);
      ctx.stroke();

      // Glowing golden line-art
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.55)';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Royal Mukut (Crown)
      ctx.beginPath();
      ctx.moveTo(-22, -26);
      ctx.lineTo(-14, -58);
      ctx.lineTo(0, -70);
      ctx.lineTo(14, -58);
      ctx.lineTo(22, -26);
      ctx.closePath();
      ctx.stroke();

      // Crown Tiers & Ruby Gem
      ctx.beginPath();
      ctx.moveTo(-18, -42);
      ctx.lineTo(18, -42);
      ctx.moveTo(-12, -54);
      ctx.lineTo(12, -54);
      ctx.stroke();

      ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.beginPath();
      ctx.arc(0, -42, 3, 0, Math.PI * 2);
      ctx.fill();

      // Divine Ears
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.55)';
      // Left ear
      ctx.beginPath();
      ctx.moveTo(-14, -22);
      ctx.bezierCurveTo(-45, -28, -48, 8, -20, 16);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-18, -14);
      ctx.bezierCurveTo(-34, -18, -36, 4, -20, 8);
      ctx.stroke();

      // Right ear
      ctx.beginPath();
      ctx.moveTo(14, -22);
      ctx.bezierCurveTo(45, -28, 48, 8, 20, 16);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(18, -14);
      ctx.bezierCurveTo(34, -18, 36, 4, 20, 8);
      ctx.stroke();

      // Divine Head Contour
      ctx.beginPath();
      ctx.moveTo(-16, -24);
      ctx.bezierCurveTo(-20, -6, -18, 6, -12, 14);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(16, -24);
      ctx.bezierCurveTo(20, -6, 18, 6, 12, 14);
      ctx.stroke();

      // Sacred Chandan Tilak
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -18, 7, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
      ctx.beginPath();
      ctx.arc(0, -15, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Serene Almond Eyes
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.6)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-12, -8);
      ctx.quadraticCurveTo(-7, -12, -2, -8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(2, -8);
      ctx.quadraticCurveTo(7, -12, 12, -8);
      ctx.stroke();

      // Graceful Curved Trunk holding Golden Modak
      ctx.beginPath();
      ctx.moveTo(-5, 0);
      ctx.bezierCurveTo(-6, 20, -18, 34, -28, 24);
      ctx.bezierCurveTo(-35, 16, -28, 8, -20, 14);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(4, 0);
      ctx.bezierCurveTo(2, 18, -10, 32, -24, 28);
      ctx.stroke();

      // Single White Tusk (Ekadanta)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.moveTo(9, 6);
      ctx.lineTo(16, 12);
      ctx.lineTo(10, 12);
      ctx.closePath();
      ctx.fill();

      // Auspicious Golden Modak at tip of trunk
      ctx.fillStyle = 'rgba(251, 191, 36, 0.85)';
      ctx.beginPath();
      ctx.arc(-22, 12, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
      ctx.beginPath();
      ctx.arc(-22, 10, 1.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // --- DRAW LIVE BURSTING FIREWORKS ---
      ctx.save();
      // Render rising rockets
      eng.fireworkRockets.forEach((r) => {
        const screenRx = r.x - eng.cameraX;
        ctx.fillStyle = r.color;
        ctx.beginPath();
        ctx.arc(screenRx, r.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render bursting spark particles
      eng.fireworkSparks.forEach((sp) => {
        const screenSx = sp.x - eng.cameraX;
        ctx.globalAlpha = Math.max(0, sp.alpha);
        ctx.fillStyle = sp.color;
        ctx.beginPath();
        ctx.arc(screenSx, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // ==========================================
      // WORLD CAMERA TRANSLATION
      // ==========================================
      ctx.save();
      ctx.translate(-Math.floor(eng.cameraX), 0);

      // --- DRAW BLOCKS: RICH TERRACOTTA & LOTUS PLATFORMS & PEDESTALS ---
      eng.blocks.forEach((b) => {
        if (b.x + b.w < eng.cameraX - 40 || b.x > eng.cameraX + w + 40) return;

        const drawY = b.y + b.bumpY;

        if (b.type === 'ground') {
          // Rich Terracotta wood & stone platform floor
          const terraGrad = ctx.createLinearGradient(b.x, drawY, b.x, drawY + b.h);
          terraGrad.addColorStop(0, '#9A3412'); // Warm terracotta clay
          terraGrad.addColorStop(0.35, '#7C2D12'); // Deep fired ceramic
          terraGrad.addColorStop(1, '#431407'); // Dark earthen foundation
          ctx.fillStyle = terraGrad;
          ctx.fillRect(b.x, drawY, b.w, b.h);

          // Golden Filigree Top Bevel / Rim
          const goldRim = ctx.createLinearGradient(b.x, drawY, b.x, drawY + 8);
          goldRim.addColorStop(0, '#FDE047');
          goldRim.addColorStop(0.5, '#F59E0B');
          goldRim.addColorStop(1, '#B45309');
          ctx.fillStyle = goldRim;
          ctx.fillRect(b.x, drawY, b.w, 6);

          // Engraved Carved Lotus Flower Motif on the stone
          const cx = b.x + b.w / 2;
          const cy = drawY + 22;
          ctx.strokeStyle = 'rgba(254, 240, 138, 0.35)';
          ctx.lineWidth = 1.3;

          // Center lotus petal
          ctx.beginPath();
          ctx.ellipse(cx, cy - 2, 3.5, 8, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Left lotus petal
          ctx.beginPath();
          ctx.ellipse(cx - 6, cy, 3.5, 7, -0.4, 0, Math.PI * 2);
          ctx.stroke();

          // Right lotus petal
          ctx.beginPath();
          ctx.ellipse(cx + 6, cy, 3.5, 7, 0.4, 0, Math.PI * 2);
          ctx.stroke();

          // Lotus base bud
          ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
          ctx.beginPath();
          ctx.arc(cx, cy + 6, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Terracotta tile border
          ctx.strokeStyle = '#320E05';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(b.x, drawY, b.w, b.h);
        } else if (b.type === 'pedestal') {
          // Decorative Stepped Temple Pedestal (Replacing pipe tunnels)
          const pedGrad = ctx.createLinearGradient(b.x, drawY, b.x, drawY + b.h);
          pedGrad.addColorStop(0, '#B45309');
          pedGrad.addColorStop(0.4, '#854D0E');
          pedGrad.addColorStop(1, '#451A03');
          ctx.fillStyle = pedGrad;
          ctx.fillRect(b.x, drawY, b.w, b.h);

          // Golden Cap Bevel
          ctx.fillStyle = '#F59E0B';
          ctx.fillRect(b.x, drawY, b.w, 7);
          ctx.fillStyle = '#FEF08A';
          ctx.fillRect(b.x, drawY, b.w, 2);

          // Carved temple diamond motif
          const pcx = b.x + b.w / 2;
          const pcy = drawY + b.h / 2;
          ctx.strokeStyle = '#FDE047';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(pcx - 8, pcy - 8, 16, 16);

          ctx.strokeStyle = '#290E04';
          ctx.lineWidth = 2;
          ctx.strokeRect(b.x, drawY, b.w, b.h);
        } else if (b.type === 'brick') {
          // Carved Temple Brick
          ctx.fillStyle = '#964326';
          ctx.fillRect(b.x, drawY, b.w, b.h);
          ctx.strokeStyle = '#5C2411';
          ctx.lineWidth = 2;
          ctx.strokeRect(b.x, drawY, b.w, b.h);
          ctx.strokeRect(b.x + 4, drawY + 4, b.w - 8, b.h - 8);
        } else if (b.type === 'question_super') {
          // SACRED DIVINE ABILITY SHRINE [ ⚡ ABILITY ]
          // Upward beacon of light to make abilities easy to find
          const beaconGrad = ctx.createLinearGradient(b.x + b.w / 2, drawY - 80, b.x + b.w / 2, drawY);
          beaconGrad.addColorStop(0, 'rgba(253, 224, 71, 0)');
          beaconGrad.addColorStop(0.7, 'rgba(251, 191, 36, 0.22)');
          beaconGrad.addColorStop(1, 'rgba(245, 158, 11, 0.45)');
          ctx.fillStyle = beaconGrad;
          ctx.fillRect(b.x - 3, drawY - 80, b.w + 6, 80);

          // Floating Badge above shrine
          ctx.fillStyle = '#FEF08A';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText('⚡ POWER', b.x + b.w / 2, drawY - 5);

          // Golden-Ruby Shrine Block
          const blockGrad = ctx.createLinearGradient(b.x, drawY, b.x + b.w, drawY + b.h);
          blockGrad.addColorStop(0, '#FBBF24');
          blockGrad.addColorStop(0.5, '#F59E0B');
          blockGrad.addColorStop(1, '#92400E');
          ctx.fillStyle = blockGrad;
          ctx.fillRect(b.x, drawY, b.w, b.h);

          // Pulsing Golden Border
          ctx.strokeStyle = '#FEF08A';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(b.x, drawY, b.w, b.h);

          // Corner Gem Insets
          ctx.fillStyle = '#DC2626';
          [-1, 1].forEach((dx) => {
            [-1, 1].forEach((dy) => {
              ctx.beginPath();
              ctx.arc(
                b.x + b.w / 2 + dx * (b.w / 2 - 5),
                drawY + b.h / 2 + dy * (b.h / 2 - 5),
                2.8,
                0,
                Math.PI * 2
              );
              ctx.fill();
            });
          });

          // Bold Lightning / Divine Symbol
          ctx.fillStyle = '#FFFBEB';
          ctx.font = 'bold 22px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⚡', b.x + b.w / 2, drawY + b.h / 2 + 1);
        } else if (b.type === 'question_modak') {
          // Regular Auspicious Modak Shrine Block [ ? ]
          const blockGrad = ctx.createLinearGradient(b.x, drawY, b.x + b.w, drawY + b.h);
          blockGrad.addColorStop(0, '#F59E0B');
          blockGrad.addColorStop(1, '#D97706');
          ctx.fillStyle = blockGrad;
          ctx.fillRect(b.x, drawY, b.w, b.h);

          // Golden Border & Studs
          ctx.strokeStyle = '#78350F';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(b.x, drawY, b.w, b.h);

          ctx.fillStyle = '#B45309';
          [-1, 1].forEach((dx) => {
            [-1, 1].forEach((dy) => {
              ctx.beginPath();
              ctx.arc(
                b.x + b.w / 2 + dx * (b.w / 2 - 5),
                drawY + b.h / 2 + dy * (b.h / 2 - 5),
                2.5,
                0,
                Math.PI * 2
              );
              ctx.fill();
            });
          });

          // Bold Question Mark
          ctx.fillStyle = '#FFFBEB';
          ctx.font = 'bold 20px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('?', b.x + b.w / 2, drawY + b.h / 2 + 1);
        } else if (b.type === 'empty') {
          ctx.fillStyle = '#6E4534';
          ctx.fillRect(b.x, drawY, b.w, b.h);
          ctx.strokeStyle = '#43261B';
          ctx.lineWidth = 2;
          ctx.strokeRect(b.x, drawY, b.w, b.h);
        }
      });

      // --- DRAW FLOATING REALISTIC MODAKS WITH SACRED EFFECTS ---
      eng.floatingModaks.forEach((m) => {
        const cx = m.x + m.w / 2;
        const cy = m.y + m.h / 2;

        ctx.save();

        // Upward celestial ray & hovering label for rare divine modaks
        if (m.type !== 'regular') {
          const rayGrad = ctx.createLinearGradient(cx, cy - 70, cx, cy);
          const rayColor =
            m.type === 'rare_trishul'
              ? 'rgba(56, 189, 248,'
              : m.type === 'rare_lotus'
              ? 'rgba(251, 113, 133,'
              : m.type === 'rare_shield'
              ? 'rgba(52, 211, 153,'
              : 'rgba(253, 224, 71,';

          rayGrad.addColorStop(0, `${rayColor} 0)`);
          rayGrad.addColorStop(0.7, `${rayColor} 0.25)`);
          rayGrad.addColorStop(1, `${rayColor} 0.5)`);
          ctx.fillStyle = rayGrad;
          ctx.fillRect(cx - 10, cy - 70, 20, 70);

          const badgeLabel =
            m.type === 'rare_trishul'
              ? '⚡ TRISHUL'
              : m.type === 'rare_lotus'
              ? '🪷 GLIDE'
              : m.type === 'rare_shield'
              ? '🛡️ KAVACH'
              : '💎 AMRIT';

          ctx.fillStyle = '#FEF08A';
          ctx.font = 'bold 8.5px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(badgeLabel, cx, cy - 24);
        }

        // 1. Dynamic Rotating Rays & Shimmering Aura
        const pulse = Math.sin(eng.gameTime * 4 + m.id);
        const auraRadius = 24 + pulse * 4;
        const aura = ctx.createRadialGradient(cx, cy, 3, cx, cy, auraRadius);

        if (m.type === 'rare_trishul') {
          aura.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
          aura.addColorStop(0.5, 'rgba(14, 165, 233, 0.4)');
          aura.addColorStop(1, 'rgba(2, 132, 199, 0)');
        } else if (m.type === 'rare_lotus') {
          aura.addColorStop(0, 'rgba(251, 113, 133, 0.85)');
          aura.addColorStop(0.5, 'rgba(244, 63, 94, 0.35)');
          aura.addColorStop(1, 'rgba(225, 29, 72, 0)');
        } else if (m.type === 'rare_shield') {
          aura.addColorStop(0, 'rgba(52, 211, 153, 0.85)');
          aura.addColorStop(0.5, 'rgba(16, 185, 129, 0.35)');
          aura.addColorStop(1, 'rgba(5, 150, 105, 0)');
        } else if (m.type === 'rare_amrit') {
          aura.addColorStop(0, 'rgba(253, 224, 71, 0.95)');
          aura.addColorStop(0.5, 'rgba(245, 158, 11, 0.45)');
          aura.addColorStop(1, 'rgba(217, 119, 6, 0)');
        } else {
          aura.addColorStop(0, 'rgba(251, 191, 36, 0.75)');
          aura.addColorStop(0.6, 'rgba(245, 158, 11, 0.25)');
          aura.addColorStop(1, 'rgba(245, 158, 11, 0)');
        }

        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(cx, cy, auraRadius, 0, Math.PI * 2);
        ctx.fill();

        // 2. Micro radiating light rays
        ctx.strokeStyle = m.type === 'rare_trishul' ? 'rgba(186, 230, 253, 0.45)' : m.type === 'rare_lotus' ? 'rgba(254, 205, 211, 0.45)' : 'rgba(254, 240, 138, 0.45)';
        ctx.lineWidth = 1;
        const rayCount = m.type !== 'regular' ? 12 : 8;
        for (let r = 0; r < rayCount; r++) {
          const rAng = (r / rayCount) * Math.PI * 2 + eng.gameTime * (m.type !== 'regular' ? 2 : 1);
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(rAng) * 12, cy + Math.sin(rAng) * 12);
          ctx.lineTo(cx + Math.cos(rAng) * (auraRadius - 2), cy + Math.sin(rAng) * (auraRadius - 2));
          ctx.stroke();
        }

        // 3. Orbiting sparkle stars
        const starColor = m.type === 'rare_trishul' ? '#BAE6FD' : m.type === 'rare_lotus' ? '#FECDD3' : '#FEF08A';
        ctx.fillStyle = starColor;
        for (let s = 0; s < 4; s++) {
          const sAng = eng.gameTime * 2.5 + s * (Math.PI / 2) + m.id;
          const sDist = 18 + Math.sin(eng.gameTime * 3 + s) * 3;
          const sx = cx + Math.cos(sAng) * sDist;
          const sy = cy + Math.sin(sAng) * sDist;

          // Tiny 4-point twinkle star
          ctx.beginPath();
          ctx.moveTo(sx, sy - 3);
          ctx.lineTo(sx + 1, sy);
          ctx.lineTo(sx + 3, sy);
          ctx.lineTo(sx + 1, sy + 1);
          ctx.lineTo(sx, sy + 3);
          ctx.lineTo(sx - 1, sy + 1);
          ctx.lineTo(sx - 3, sy);
          ctx.lineTo(sx - 1, sy);
          ctx.closePath();
          ctx.fill();
        }

        // 4. Modak Body
        ctx.translate(cx, cy);

        // Rare base effect (Lotus petals or Sudarshan ring)
        if (m.type === 'rare_lotus') {
          ctx.fillStyle = '#FB7185';
          for (let pIdx = -2; pIdx <= 2; pIdx++) {
            ctx.beginPath();
            ctx.ellipse(pIdx * 5, 12, 4, 7, (pIdx * Math.PI) / 8, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (m.type === 'rare_shield') {
          ctx.strokeStyle = '#34D399';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.ellipse(0, 11, 15, 6, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Modak Silhouette
        ctx.beginPath();
        ctx.moveTo(0, -13);
        ctx.bezierCurveTo(8, -8, 13, 2, 11, 9);
        ctx.bezierCurveTo(9, 13, -9, 13, -11, 9);
        ctx.bezierCurveTo(-13, 2, -8, -8, 0, -13);
        ctx.closePath();

        const modakGrad = ctx.createLinearGradient(0, -13, 0, 13);
        if (m.type === 'rare_trishul') {
          modakGrad.addColorStop(0, '#E0F2FE');
          modakGrad.addColorStop(0.4, '#7DD3FC');
          modakGrad.addColorStop(1, '#0284C7');
        } else if (m.type === 'rare_lotus') {
          modakGrad.addColorStop(0, '#FFE4E6');
          modakGrad.addColorStop(0.4, '#FDA4AF');
          modakGrad.addColorStop(1, '#E11D48');
        } else if (m.type === 'rare_shield') {
          modakGrad.addColorStop(0, '#D1FAE5');
          modakGrad.addColorStop(0.4, '#6EE7B7');
          modakGrad.addColorStop(1, '#059669');
        } else if (m.type === 'rare_amrit') {
          modakGrad.addColorStop(0, '#FFFBEB');
          modakGrad.addColorStop(0.3, '#FDE047');
          modakGrad.addColorStop(0.7, '#F59E0B');
          modakGrad.addColorStop(1, '#B45309');
        } else {
          modakGrad.addColorStop(0, '#FEF08A');
          modakGrad.addColorStop(0.4, '#FBBF24');
          modakGrad.addColorStop(1, '#D97706');
        }
        ctx.fillStyle = modakGrad;
        ctx.fill();

        // Fluted pleats
        ctx.strokeStyle = m.type === 'rare_trishul' ? '#0369A1' : m.type === 'rare_lotus' ? '#BE123C' : m.type === 'rare_shield' ? '#047857' : '#B45309';
        ctx.lineWidth = 1.2;
        [-6, -2, 2, 6].forEach((px) => {
          ctx.beginPath();
          ctx.moveTo(0, -12);
          ctx.quadraticCurveTo(px * 0.7, 0, px, 11);
          ctx.stroke();
        });

        // Top sacred Bindu / Jewel
        ctx.fillStyle = m.type === 'rare_trishul' ? '#38BDF8' : '#DC2626';
        ctx.beginPath();
        ctx.arc(0, -12, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Emblem in center for rare powers
        if (m.type === 'rare_trishul') {
          // Golden mini trident
          ctx.strokeStyle = '#FEF08A';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(0, 7);
          ctx.lineTo(0, -3);
          ctx.moveTo(-3, -1);
          ctx.lineTo(0, 1);
          ctx.lineTo(3, -1);
          ctx.stroke();
        }

        ctx.restore();
      });

      // --- DRAW SUPER & ABILITY POWER ITEMS ---
      eng.superItems.forEach((item) => {
        const ix = item.x + item.w / 2;
        const iy = item.y + item.h / 2;

        ctx.save();
        ctx.translate(ix, iy);

        // Power Aura
        const pGlow = ctx.createRadialGradient(0, 0, 3, 0, 0, 20);
        const glowCol = item.type === 'trishul' ? 'rgba(56, 189, 248, 0.7)' : item.type === 'lotus' ? 'rgba(244, 63, 94, 0.7)' : item.type === 'shield' ? 'rgba(52, 211, 153, 0.7)' : 'rgba(251, 191, 36, 0.7)';
        pGlow.addColorStop(0, glowCol);
        pGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = pGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();

        if (item.type === 'trishul') {
          // Golden Trishul Weapon
          ctx.strokeStyle = '#FDE047';
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(0, 12);
          ctx.lineTo(0, -10); // Center spear
          ctx.moveTo(-7, -4);
          ctx.quadraticCurveTo(-6, 0, 0, 2);
          ctx.quadraticCurveTo(6, 0, 7, -4);
          ctx.stroke();
          // Trishul points
          ctx.fillStyle = '#FEF08A';
          [-7, 0, 7].forEach((px) => {
            ctx.beginPath();
            ctx.arc(px, px === 0 ? -11 : -5, 2, 0, Math.PI * 2);
            ctx.fill();
          });
        } else if (item.type === 'lotus') {
          // Blooming Sacred Lotus Flower
          ctx.fillStyle = '#FB7185';
          for (let lp = 0; lp < 8; lp++) {
            const lAng = (lp / 8) * Math.PI * 2 + eng.gameTime;
            ctx.beginPath();
            ctx.ellipse(Math.cos(lAng) * 7, Math.sin(lAng) * 7, 4, 7, lAng, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = '#FDE047';
          ctx.beginPath();
          ctx.arc(0, 0, 5, 0, Math.PI * 2);
          ctx.fill();
        } else if (item.type === 'shield') {
          // Sudarshan Chakra Wheel
          const cAng = eng.gameTime * 4;
          ctx.rotate(cAng);
          ctx.strokeStyle = '#34D399';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#FDE047';
          for (let sp = 0; sp < 6; sp++) {
            const sAng = (sp / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(Math.cos(sAng) * 5, Math.sin(sAng) * 5);
            ctx.lineTo(Math.cos(sAng) * 12, Math.sin(sAng) * 12);
            ctx.stroke();
          }
        } else {
          // Giant Amrit Super Modak
          ctx.fillStyle = '#F59E0B';
          ctx.beginPath();
          ctx.arc(0, 0, 13, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#DC2626';
          ctx.beginPath();
          ctx.arc(0, -5, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      // --- DRAW THUNDER SPARKS (Electric Bolts) ---
      eng.thunderSparks.forEach((ts) => {
        ctx.save();
        ctx.translate(ts.x, ts.y);

        // Electric Blue Glow
        const sparkGlow = ctx.createRadialGradient(0, 0, 2, 0, 0, 16);
        sparkGlow.addColorStop(0, 'rgba(56, 189, 248, 0.95)');
        sparkGlow.addColorStop(0.5, 'rgba(253, 224, 71, 0.6)');
        sparkGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = sparkGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();

        // Sharp Lightning Bolt Path
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(-3, -6);
        ctx.lineTo(2, 4);
        ctx.lineTo(10, 0);
        ctx.stroke();

        ctx.restore();
      });

      // --- DRAW ENEMIES (Monkeys, Coconuts, Fire Demons) ---
      eng.enemies.forEach((e) => {
        if (e.x + e.w < eng.cameraX - 40 || e.x > eng.cameraX + w + 40) return;

        const ex = e.x;
        const ey = e.y;

        if (e.isSquished) {
          ctx.fillStyle = '#78350F';
          ctx.fillRect(ex, ey + 20, e.w, 12);
          return;
        }

        if (e.type === 'monkey') {
          // Playful Temple Vanara Monkey
          ctx.fillStyle = '#854D0E';
          ctx.beginPath();
          ctx.arc(ex + e.w / 2, ey + e.h / 2, 14, 0, Math.PI * 2);
          ctx.fill();

          // Face
          ctx.fillStyle = '#FDE047';
          ctx.beginPath();
          ctx.arc(ex + e.w / 2, ey + e.h / 2 + 2, 8, 0, Math.PI * 2);
          ctx.fill();

          // Eyes
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(ex + e.w / 2 - 3, ey + e.h / 2, 2, 0, Math.PI * 2);
          ctx.arc(ex + e.w / 2 + 3, ey + e.h / 2, 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (e.type === 'coconut') {
          // Rolling Sacred Coconut (Nariyal)
          ctx.fillStyle = '#78350F';
          ctx.beginPath();
          ctx.arc(ex + e.w / 2, ey + e.h / 2, 13, 0, Math.PI * 2);
          ctx.fill();

          // 3 Coconut eye dots
          ctx.fillStyle = '#3B1E08';
          ctx.beginPath();
          ctx.arc(ex + e.w / 2 - 3, ey + e.h / 2 - 2, 2, 0, Math.PI * 2);
          ctx.arc(ex + e.w / 2 + 3, ey + e.h / 2 - 2, 2, 0, Math.PI * 2);
          ctx.arc(ex + e.w / 2, ey + e.h / 2 + 3, 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Fire Demon Spark
          ctx.fillStyle = '#DC2626';
          ctx.beginPath();
          ctx.arc(ex + e.w / 2, ey + e.h / 2, 13, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#FBBF24';
          ctx.beginPath();
          ctx.arc(ex + e.w / 2, ey + e.h / 2 - 2, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // ==============================================================
      // --- DRAW SACRED MAHA GHANTI STAMBHA & HINDU TEMPLE GOPURAM ---
      // ==============================================================
      const tg = eng.templeGoal;
      const currentStageCfg = STAGE_CONFIGS[Math.max(0, Math.min(STAGE_CONFIGS.length - 1, stage - 1))];

      // 1. SACRED BELL STAMBHA (Pillar with Hanging Giant Brass Temple Bell)
      const stX = tg.stambhaX;
      const stY = tg.stambhaY;
      const stH = tg.stambhaH;

      // Base stepped stone plinth of the Stambha
      ctx.fillStyle = '#78350F';
      ctx.fillRect(stX - 16, stY + stH - 18, 42, 18);
      ctx.fillStyle = '#92400E';
      ctx.fillRect(stX - 10, stY + stH - 32, 30, 14);

      // Brass Pillar Column
      const pillarGrad = ctx.createLinearGradient(stX, stY, stX + 12, stY);
      pillarGrad.addColorStop(0, '#B45309');
      pillarGrad.addColorStop(0.3, '#F59E0B');
      pillarGrad.addColorStop(0.7, '#FEF08A');
      pillarGrad.addColorStop(1, '#92400E');
      ctx.fillStyle = pillarGrad;
      ctx.fillRect(stX, stY + 24, 10, stH - 56);

      // Ornamental golden ring moldings along the pillar
      ctx.fillStyle = '#FEF08A';
      for (let rY = stY + 60; rY < stY + stH - 50; rY += 45) {
        ctx.fillRect(stX - 2, rY, 14, 4);
      }

      // Pillar Capital & Ornate Carved Bracket extending right
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(stX - 6, stY + 16, 22, 8);
      ctx.beginPath();
      ctx.moveTo(stX, stY + 24);
      ctx.lineTo(stX + 28, stY + 8);
      ctx.lineTo(stX + 32, stY + 16);
      ctx.lineTo(stX + 8, stY + 36);
      ctx.closePath();
      ctx.fill();

      // Top Lotus Finial of the Stambha
      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.arc(stX + 5, stY + 10, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(stX + 5, stY);
      ctx.lineTo(stX + 1, stY + 8);
      ctx.lineTo(stX + 9, stY + 8);
      ctx.closePath();
      ctx.fill();

      // Suspended Brass Chain
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(stX + 26, stY + 12);
      ctx.lineTo(tg.bellX, tg.bellY);
      ctx.stroke();

      // Giant Brass Maha Ghanti (Temple Bell) with Dynamic Pendulum Swing Physics!
      ctx.save();
      ctx.translate(tg.bellX, tg.bellY);
      ctx.rotate(tg.bellSwing);

      // Bell Suspension Ring
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.stroke();

      // Bell Crown (Dome top)
      const bellGrad = ctx.createLinearGradient(-18, 0, 18, 0);
      bellGrad.addColorStop(0, '#B45309');
      bellGrad.addColorStop(0.3, '#F59E0B');
      bellGrad.addColorStop(0.6, '#FEF08A');
      bellGrad.addColorStop(1, '#92400E');
      ctx.fillStyle = bellGrad;

      ctx.beginPath();
      ctx.moveTo(-10, 5);
      ctx.bezierCurveTo(-14, 14, -18, 26, -22, 38);
      ctx.lineTo(22, 38);
      ctx.bezierCurveTo(18, 26, 14, 14, 10, 5);
      ctx.closePath();
      ctx.fill();

      // Flared Acoustic Rim of the Bell
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.ellipse(0, 38, 23, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#B45309';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Sacred Om 'ॐ' Engraved on Bell
      ctx.fillStyle = '#78350F';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ॐ', 0, 22);

      // Bell Clapper & Red Tassel swinging beneath
      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.arc(0, 41, 4, 0, Math.PI * 2);
      ctx.fill();

      // Sacred Red Silk Cord / Tassel
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 42);
      ctx.lineTo(Math.sin(tg.bellSwing * 2) * 5, 58);
      ctx.stroke();

      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(Math.sin(tg.bellSwing * 2) * 5, 60, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // 2. MAJESTIC HINDU TEMPLE MANDIR / GOPURAM (Replacing old tent!)
      const tx = tg.templeX;
      const ty = tg.templeY;
      const tw = tg.templeW;

      ctx.save();

      // A. Ground Plinth & Grand Stone Steps
      const plinthGrad = ctx.createLinearGradient(tx, ty - 20, tx, ty);
      plinthGrad.addColorStop(0, '#57534E');
      plinthGrad.addColorStop(1, '#292524');
      ctx.fillStyle = plinthGrad;
      ctx.fillRect(tx - 15, ty - 24, tw + 30, 24);

      // Carved step levels leading into sanctum
      for (let s = 0; s < 4; s++) {
        const stepW = tw - 40 - s * 16;
        const stepX = tx + 20 + s * 8;
        const stepY = ty - (4 - s) * 6;
        ctx.fillStyle = s % 2 === 0 ? '#78716C' : '#A8A29E';
        ctx.fillRect(stepX, stepY, stepW, 6);
      }

      // B. Standing Brass Diyas (Deepastambhas) flanking the entrance
      const drawDiya = (dx: number) => {
        ctx.fillStyle = '#D97706';
        ctx.fillRect(dx - 6, ty - 24, 12, 4);
        ctx.fillRect(dx - 2, ty - 60, 4, 36);
        ctx.beginPath();
        ctx.ellipse(dx, ty - 60, 8, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Flickering Golden Flame
        const flamePulse = Math.sin(eng.gameTime * 8 + dx) * 2;
        const flameGrad = ctx.createRadialGradient(dx, ty - 66, 1, dx, ty - 66, 12);
        flameGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
        flameGrad.addColorStop(0.4, 'rgba(245, 158, 11, 0.75)');
        flameGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.arc(dx, ty - 66 + flamePulse * 0.5, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FEF08A';
        ctx.beginPath();
        ctx.moveTo(dx - 3, ty - 62);
        ctx.quadraticCurveTo(dx, ty - 74 + flamePulse, dx, ty - 75 + flamePulse);
        ctx.quadraticCurveTo(dx, ty - 74 + flamePulse, dx + 3, ty - 62);
        ctx.closePath();
        ctx.fill();
      };
      drawDiya(tx + 8);
      drawDiya(tx + tw - 8);

      // C. Temple Sanctum Walls & Garbhagriha
      const sanctumBaseY = ty - 140;
      const wallColor = currentStageCfg.templeColor || '#831843';

      ctx.fillStyle = wallColor;
      ctx.fillRect(tx, sanctumBaseY, tw, 116);

      // Carved corner pillars
      const pillarColorGrad = ctx.createLinearGradient(tx, sanctumBaseY, tx + 18, sanctumBaseY);
      pillarColorGrad.addColorStop(0, '#D97706');
      pillarColorGrad.addColorStop(0.5, '#F59E0B');
      pillarColorGrad.addColorStop(1, '#92400E');
      ctx.fillStyle = pillarColorGrad;
      ctx.fillRect(tx + 4, sanctumBaseY, 16, 116);
      ctx.fillRect(tx + tw - 20, sanctumBaseY, 16, 116);

      // D. Deep Sanctum Archway (Garbhagriha Entrance)
      const doorW = 86;
      const doorH = 92;
      const doorX = tx + (tw - doorW) / 2;
      const doorY = ty - 24 - doorH;

      // Dark sacred sanctum interior
      ctx.fillStyle = '#090714';
      ctx.beginPath();
      ctx.moveTo(doorX, doorY + doorH);
      ctx.lineTo(doorX, doorY + 36);
      ctx.quadraticCurveTo(doorX + doorW / 2, doorY - 14, doorX + doorW, doorY + 36);
      ctx.lineTo(doorX + doorW, doorY + doorH);
      ctx.closePath();
      ctx.fill();

      // Ornate Golden Torana Arch Border
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Golden Marigold Torana Swag across door
      ctx.fillStyle = '#F97316';
      for (let m = 0; m < 9; m++) {
        const mx = doorX + 4 + m * 9.5;
        const my = doorY + 36 + Math.sin((m / 8) * Math.PI) * 12;
        ctx.beginPath();
        ctx.arc(mx, my, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // E. GOLDEN LORD GANESHA IDOL INSIDE THE GARBHAGRIHA
      const idolX = doorX + doorW / 2;
      const idolY = doorY + 46;

      // Divine Radiant Sunburst Halo (Prabhavali)
      const prabhaPulse = Math.sin(eng.gameTime * 3) * 3;
      const prabhaGrad = ctx.createRadialGradient(idolX, idolY, 4, idolX, idolY, 36 + prabhaPulse);
      prabhaGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
      prabhaGrad.addColorStop(0.4, 'rgba(245, 158, 11, 0.55)');
      prabhaGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = prabhaGrad;
      ctx.beginPath();
      ctx.arc(idolX, idolY, 36 + prabhaPulse, 0, Math.PI * 2);
      ctx.fill();

      // Golden Idol Head & Body Silhouette
      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.ellipse(idolX, idolY + 14, 16, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head & Big Ears
      ctx.beginPath();
      ctx.ellipse(idolX - 12, idolY, 6, 8, -0.3, 0, Math.PI * 2);
      ctx.ellipse(idolX + 12, idolY, 6, 8, 0.3, 0, Math.PI * 2);
      ctx.arc(idolX, idolY, 10, 0, Math.PI * 2);
      ctx.fill();

      // Golden Mukut (Crown)
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.moveTo(idolX - 8, idolY - 8);
      ctx.lineTo(idolX, idolY - 24);
      ctx.lineTo(idolX + 8, idolY - 8);
      ctx.closePath();
      ctx.fill();

      // Red Tilak
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(idolX, idolY - 3, 2, 0, Math.PI * 2);
      ctx.fill();

      // Curved Trunk holding golden modak
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(idolX, idolY + 3);
      ctx.quadraticCurveTo(idolX - 6, idolY + 14, idolX - 12, idolY + 11);
      ctx.stroke();

      // Modak in hand
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(idolX - 14, idolY + 10, 3, 0, Math.PI * 2);
      ctx.fill();

      // F. MULTI-TIERED GOPURAM / SHIKHARA ROOF LEVELS (Carved Hindu Temple Architecture)
      // Tier 1: Lower Cornice (Kapota) with ornamental brackets
      const t1Y = sanctumBaseY;
      ctx.fillStyle = '#B45309';
      ctx.fillRect(tx - 10, t1Y - 14, tw + 20, 14);
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(tx - 12, t1Y - 16, tw + 24, 4);

      // Carved miniature niches (Kudus) along Tier 1
      ctx.fillStyle = '#78350F';
      for (let k = tx + 10; k < tx + tw - 10; k += 26) {
        ctx.beginPath();
        ctx.arc(k, t1Y - 7, 5, Math.PI, 0);
        ctx.fill();
      }

      // Tier 2: Middle Stepped Tower Tier
      const t2W = tw - 40;
      const t2X = tx + 20;
      const t2Y = t1Y - 50;
      ctx.fillStyle = wallColor;
      ctx.fillRect(t2X, t2Y, t2W, 34);
      ctx.fillStyle = '#D97706';
      ctx.fillRect(t2X - 6, t2Y - 10, t2W + 12, 10);
      ctx.fillStyle = '#FEF08A';
      ctx.fillRect(t2X - 8, t2Y - 12, t2W + 16, 3);

      // Tier 3: Upper Stepped Tower Tier
      const t3W = t2W - 40;
      const t3X = t2X + 20;
      const t3Y = t2Y - 44;
      ctx.fillStyle = wallColor;
      ctx.fillRect(t3X, t3Y, t3W, 32);
      ctx.fillStyle = '#B45309';
      ctx.fillRect(t3X - 6, t3Y - 10, t3W + 12, 10);

      // G. Shikhara Crown Amla & Gleaming Golden Kalash Finials
      const amlaX = t3X + t3W / 2;
      const amlaY = t3Y - 14;

      // Ribbed Amla Stone
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.ellipse(amlaX, amlaY, 32, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Multiple Golden Kalash Finials crowning the spire!
      const kalashCount = currentStageCfg.kalashCount || 3;
      const kSpacing = 16;
      const kStartX = amlaX - ((kalashCount - 1) * kSpacing) / 2;

      for (let k = 0; k < kalashCount; k++) {
        const kx = kStartX + k * kSpacing;
        const isCenter = k === Math.floor(kalashCount / 2);
        const ky = isCenter ? amlaY - 16 : amlaY - 10;
        const kRad = isCenter ? 8 : 6;

        // Golden Urn Body
        ctx.fillStyle = '#FDE047';
        ctx.beginPath();
        ctx.arc(kx, ky, kRad, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(kx - kRad + 1, ky - 2, (kRad - 1) * 2, 4);

        // Coconut & Mango Leaves Pointed Tip
        ctx.fillStyle = '#16A34A';
        ctx.beginPath();
        ctx.moveTo(kx - 4, ky - kRad + 2);
        ctx.lineTo(kx, ky - kRad - 6);
        ctx.lineTo(kx + 4, ky - kRad + 2);
        ctx.closePath();
        ctx.fill();

        // Golden Needle Top
        ctx.strokeStyle = '#FEF08A';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(kx, ky - kRad - 6);
        ctx.lineTo(kx, ky - kRad - 12);
        ctx.stroke();
      }

      // Celestial Trishul / Om Crest on center Kalash
      ctx.fillStyle = '#FEF08A';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('🔱', amlaX, amlaY - 30);

      ctx.restore();

      // --- DRAW MUSHAK CHARACTER (BAL GANESHA DEITY IN SKY-BLUE) ---
      if (!eng.isDeadAnim || eng.deadTimer > 0) {
        ctx.save();
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        if (p.facing === 'left') ctx.scale(-1, 1);

        if (p.invulnerableTimer > 0 && Math.floor(eng.gameTime * 18) % 2 === 0) {
          ctx.globalAlpha = 0.4;
        }

        // --- ACTIVE POWER EFFECTS ON PLAYER ---
        // 1. Super Aura
        if (p.isSuper) {
          const superGlow = ctx.createRadialGradient(0, 0, 10, 0, 0, p.w + 14);
          superGlow.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
          superGlow.addColorStop(0.7, 'rgba(245, 158, 11, 0.2)');
          superGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = superGlow;
          ctx.beginPath();
          ctx.arc(0, 0, p.w + 14, 0, Math.PI * 2);
          ctx.fill();
        }

        // 2. Sudarshan Shield Chakra Orbiters
        if (p.shieldCharges > 0) {
          for (let sc = 0; sc < p.shieldCharges; sc++) {
            const scAng = eng.gameTime * 3.5 + (sc * (Math.PI * 2)) / p.shieldCharges;
            const scDist = p.w / 2 + 16;
            const sx = Math.cos(scAng) * scDist;
            const sy = Math.sin(scAng) * (scDist * 0.55);

            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(eng.gameTime * 6);
            ctx.strokeStyle = '#34D399';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, 6, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = '#A7F3D0';
            for (let b = 0; b < 4; b++) {
              const bAng = (b / 4) * Math.PI * 2;
              ctx.fillRect(Math.cos(bAng) * 4 - 1, Math.sin(bAng) * 4 - 1, 2, 2);
            }
            ctx.restore();
          }
        }

        // 3. Lotus Glide Canopy / Umbrella above Mushak
        if (p.hasLotusGlide && p.isGliding) {
          ctx.save();
          const ly = -p.h / 2 - 16;
          // Stem
          ctx.strokeStyle = '#059669';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(2, -p.h / 2 + 2);
          ctx.lineTo(2, ly);
          ctx.stroke();

          // Blooming sacred lotus canopy
          ctx.fillStyle = '#FB7185';
          for (let pIdx = -3; pIdx <= 3; pIdx++) {
            ctx.beginPath();
            ctx.ellipse(2 + pIdx * 6, ly, 5, 10, (pIdx * Math.PI) / 10, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = '#FDE047';
          ctx.beginPath();
          ctx.arc(2, ly, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Curled Tail
        ctx.strokeStyle = '#0284C7';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-p.w / 3, p.h / 4);
        ctx.quadraticCurveTo(-p.w / 2 - 8, p.h / 3 - 8, -p.w / 2 - 4, p.h / 4 - 14);
        ctx.stroke();

        // Celestial Sky-Blue Chubby Body
        ctx.fillStyle = '#38BDF8';
        ctx.beginPath();
        ctx.ellipse(0, 4, p.w / 2.2, p.h / 2.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Soft Baby Blue Belly
        ctx.fillStyle = '#BAE6FD';
        ctx.beginPath();
        ctx.ellipse(2, 6, p.w / 3.4, p.h / 3.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Golden Necklace
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2.6, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();

        // Head
        const headY = -p.h / 5;
        ctx.fillStyle = '#38BDF8';
        ctx.beginPath();
        ctx.arc(4, headY, p.w / 2.4, 0, Math.PI * 2);
        ctx.fill();

        // Big Divine Ears with Pink Inner Lining
        ctx.fillStyle = '#0284C7';
        ctx.beginPath();
        ctx.arc(-8, headY - 10, p.w / 3.2, 0, Math.PI * 2);
        ctx.arc(14, headY - 10, p.w / 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FDA4AF';
        ctx.beginPath();
        ctx.arc(-8, headY - 10, p.w / 4.8, 0, Math.PI * 2);
        ctx.arc(14, headY - 10, p.w / 4.8, 0, Math.PI * 2);
        ctx.fill();

        // Golden Royal Mukut (Crown) with Ruby Gem
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.moveTo(0, headY - 14);
        ctx.lineTo(4, headY - 24);
        ctx.lineTo(8, headY - 14);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.arc(4, headY - 17, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Forehead Chandan Tilak
        ctx.fillStyle = '#FEF08A';
        ctx.fillRect(2.5, headY - 8, 3, 4);
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.arc(4, headY - 6, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Expressive Twinkling Eyes
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.arc(1, headY - 1, 3.2, 0, Math.PI * 2);
        ctx.arc(9, headY - 1, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(2, headY - 2, 1.2, 0, Math.PI * 2);
        ctx.arc(10, headY - 2, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Cute Trunk
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(5, headY + 3);
        ctx.quadraticCurveTo(8, headY + 12, 12, headY + 10);
        ctx.stroke();

        // 4 Divine Arms Holding Sacred Implements:
        // 1. Upper Right: Silver Battle Axe (Parashu) or Golden Trishul if unlocked
        if (p.hasTrishul) {
          // Shiva's Golden Trishul with electrical tip
          ctx.strokeStyle = '#FDE047';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(-14, headY + 8);
          ctx.lineTo(-14, headY - 18); // Trident shaft
          ctx.moveTo(-19, headY - 12);
          ctx.quadraticCurveTo(-19, headY - 8, -14, headY - 8);
          ctx.quadraticCurveTo(-9, headY - 8, -9, headY - 12);
          ctx.stroke();

          // Electric zap spark
          ctx.fillStyle = '#38BDF8';
          ctx.beginPath();
          ctx.arc(-14, headY - 19, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#94A3B8';
          ctx.fillRect(-15, headY - 10, 3, 14);
          ctx.fillStyle = '#CBD5E1';
          ctx.beginPath();
          ctx.arc(-13.5, headY - 10, 5, 0, Math.PI * 2);
          ctx.fill();
        }

        // 2. Upper Left: Sacred Golden Loop (Pasha)
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(18, headY - 8, 5, 0, Math.PI * 2);
        ctx.stroke();

        // 3. Lower Right: Pink Lotus Flower
        ctx.fillStyle = '#F43F5E';
        ctx.beginPath();
        ctx.arc(-14, headY + 6, 4, 0, Math.PI * 2);
        ctx.fill();

        // 4. Lower Left: Golden Modak in hand
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(16, headY + 6, 4, 0, Math.PI * 2);
        ctx.fill();

        // Running Little Feet
        const legWalk = Math.sin(p.runAnimFrame) * 4;
        ctx.fillStyle = '#0284C7';
        ctx.fillRect(-8, p.h / 2 - 3 + legWalk, 7, 6);
        ctx.fillRect(3, p.h / 2 - 3 - legWalk, 7, 6);

        ctx.restore();
      }

      // --- DRAW EXPANDING RINGS & POPUPS ---
      eng.expandingRings.forEach((rg) => {
        ctx.save();
        ctx.strokeStyle = rg.color;
        ctx.globalAlpha = Math.max(0, rg.alpha);
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(rg.x, rg.y, rg.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      eng.particles.forEach((pt) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        if (pt.isPetal) {
          ctx.ellipse(pt.x, pt.y, pt.size, pt.size * 1.8, pt.life * 2, 0, Math.PI * 2);
        } else {
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.restore();
      });

      eng.scorePopups.forEach((sp) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, sp.alpha);
        ctx.fillStyle = sp.color;
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(sp.text, sp.x, sp.y);
        ctx.restore();
      });

      ctx.restore(); // Camera restore

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, handlePlayerDeath]);

  // Save Score
  const handleSaveScore = () => {
    addLeaderboardScore({
      playerName: playerProfile.name,
      campus: playerProfile.campus,
      gameMode: 'mushak_quest',
      score,
      metricLabel: 'pts',
      levelReached: stage,
    });
    setScoreSaved(true);
    onOpenLeaderboard();
  };

  const toggleMute = () => {
    const next = !isMuted;
    soundEngine.setMuted(next);
    setIsMuted(next);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center select-none font-sans">
      {/* Top Retro Gold HUD Bar */}
      <div className="w-full bg-[#0F172A] border-4 border-[#D4AF37] rounded-t-2xl px-4 py-2.5 flex flex-wrap items-center justify-between text-white shadow-xl">
        <div className="flex items-center gap-6 text-xs sm:text-sm font-mono font-bold tracking-wider">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400">SCORE</span>
            <span className="text-white text-base font-extrabold">{score.toString().padStart(6, '0')}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-amber-300">🥟 MODAKS</span>
            <span className="text-amber-200 text-base font-extrabold">×{modaks.toString().padStart(2, '0')}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1E293B] border border-amber-400/40 text-stone-200">
            <span className="text-[10px] text-amber-400 font-bold uppercase">STAGE</span>
            <span className="text-amber-300 font-extrabold text-sm">{stage}/10</span>
            <span className="hidden xl:inline text-[11px] text-stone-400 font-normal truncate max-w-[130px]">
              • {STAGE_CONFIGS[stage - 1]?.name || 'Sanctum'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-rose-400">
            <Heart className="w-4 h-4 fill-rose-500" />
            <span className="text-base font-extrabold text-white">×{lives}</span>
          </div>

          <div className="hidden md:flex items-center gap-1 text-stone-300">
            <span>TIME</span>
            <span className="text-amber-300 font-extrabold">{timeLeft}</span>
          </div>

          <div className="hidden lg:flex items-center gap-1 text-stone-400">
            <span>DIST</span>
            <span className="text-amber-200">{distanceMeters}m</span>
          </div>

          {/* Active Power Abilities Badges */}
          {(hasTrishul || hasLotusGlide || shieldCharges > 0 || isSuper) && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-amber-500/30">
              {hasTrishul && (
                <span className="px-2 py-0.5 rounded-md bg-sky-950/80 border border-sky-400/60 text-sky-300 text-[11px] font-bold flex items-center gap-1 shadow-xs animate-pulse">
                  ⚡ <span>TRISHUL (X)</span>
                </span>
              )}
              {hasLotusGlide && (
                <span className="px-2 py-0.5 rounded-md bg-rose-950/80 border border-rose-400/60 text-rose-300 text-[11px] font-bold flex items-center gap-1 shadow-xs">
                  🪷 <span>GLIDE (HOLD JUMP)</span>
                </span>
              )}
              {shieldCharges > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-400/60 text-emerald-300 text-[11px] font-bold flex items-center gap-1 shadow-xs">
                  🛡️ <span>KAVACH ×{shieldCharges}</span>
                </span>
              )}
              {isSuper && (
                <span className="px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-400/60 text-amber-300 text-[11px] font-bold flex items-center gap-1 shadow-xs">
                  💎 <span>SUPER</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGameState((prev) => (prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev))}
            className="p-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] border border-[#D4AF37]/40 text-[#D4AF37] cursor-pointer transition shadow-xs"
            title="Pause Game"
          >
            <Pause className="w-4 h-4" />
          </button>
          <button
            onClick={toggleMute}
            className="p-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] border border-[#D4AF37]/40 cursor-pointer transition shadow-xs"
            title="Toggle Audio"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-[#D4AF37]" />}
          </button>
        </div>
      </div>

      {/* Main Game Screen Canvas */}
      <div className="relative w-full aspect-[16/9] max-h-[500px] bg-[#060919] border-x-4 border-b-4 border-[#D4AF37] overflow-hidden flex items-center justify-center shadow-2xl">
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          className="w-full h-full object-contain block"
        />
              {/* Mobile Touch Overlay - Only displays on touch screens */}
       <div className="mobile-touch-bar fixed bottom-6 left-0 right-0 z-50 pointer-events-none px-6">
        <div className="flex justify-between items-center w-full max-w-xl mx-auto">
          
          {/* Movement Pad */}
          <div className="flex items-center gap-3 pointer-events-auto">
            <button 
              onTouchStart={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', code: 'ArrowLeft' }))}
              onTouchEnd={() => window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft', code: 'ArrowLeft' }))}
              className="w-16 h-16 rounded-full bg-slate-800/90 border border-amber-500/40 text-2xl active:bg-amber-600 flex items-center justify-center shadow-lg select-none"
            >
              ⬅️
            </button>
            <button 
              onTouchStart={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', code: 'ArrowRight' }))}
              onTouchEnd={() => window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight', code: 'ArrowRight' }))}
              className="w-16 h-16 rounded-full bg-slate-800/90 border border-amber-500/40 text-2xl active:bg-amber-600 flex items-center justify-center shadow-lg select-none"
            >
              ➡️
            </button>
          </div>

          {/* Attack & Jump Actions */}
          <div className="flex items-center gap-4 pointer-events-auto">
            <button 
              onTouchStart={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'x', code: 'KeyX' }))}
              onTouchEnd={() => window.dispatchEvent(new KeyboardEvent('keyup', { key: 'x', code: 'KeyX' }))}
              className="w-16 h-16 rounded-full bg-red-950/90 border border-red-500/50 text-red-400 font-bold text-xl flex items-center justify-center active:bg-red-600 select-none"
            >
              X
            </button>
            <button 
              onTouchStart={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space' }))}
              onTouchEnd={() => window.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', code: 'Space' }))}
              className="w-20 h-20 rounded-full bg-amber-500 text-slate-950 flex flex-col items-center justify-center shadow-2xl text-xl font-bold active:bg-amber-400 select-none"
            >
              🔼
              <span className="text-[10px] font-bold">JUMP</span>
            </button>
          </div>

        </div>
      </div>


        {/* Start Game Overlay */}
        {gameState === 'start' && (
          <div className="absolute inset-0 bg-[#060919]/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white z-20">
            <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-[#1E293B] flex items-center justify-center text-4xl shadow-2xl mb-3 border-2 border-[#D4AF37]">
              🐭
            </div>
            <div className="font-deva text-amber-300 text-sm sm:text-base font-bold mb-1">
              ॥ श्री गणेशाय नमः • मूषकराज मोदक एडवेंचर ॥
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif-title font-bold text-amber-200 mb-2 drop-shadow-md">
              Mushak's Modak Quest
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-md mb-5 leading-relaxed">
              Guide Bal Ganesha's celestial Mushak through sacred terracotta lotus platforms under a fireworks-lit sky. Collect golden modaks, stomp enemies, and use your Divine Double Jump!
            </p>

            {/* Controls Guide */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-amber-100 mb-6 bg-[#1E293B]/80 p-3 rounded-xl border border-[#D4AF37]/40 max-w-md w-full font-mono shadow-inner">
              <div>⬅️ <strong>A / Left</strong> Walk</div>
              <div>➡️ <strong>D / Right</strong> Walk</div>
              <div>⬆️ <strong>W / Space</strong> Double Jump</div>
            </div>

            <button
              onClick={() => startLevel(stage, false)}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F59E0B] to-[#D97706] text-stone-950 font-extrabold text-base shadow-2xl hover:brightness-110 active:scale-95 transition flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-stone-950" />
              <span>Start Quest</span>
            </button>
          </div>
        )}

        {/* Paused Overlay */}
        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white z-20">
            <h3 className="text-3xl font-serif-title font-bold text-amber-300 mb-3">Game Paused</h3>
            <button
              onClick={() => setGameState('playing')}
              className="px-7 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-sm shadow-xl hover:bg-amber-400 transition cursor-pointer"
            >
              Resume Journey
            </button>
          </div>
        )}

        {/* Stage Clear Screen */}
        {gameState === 'stage_clear' && (
          <div className="absolute inset-0 bg-[#060919]/92 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white z-20">
            <div className="text-5xl mb-2 animate-bounce">🔔</div>
            <div className="font-deva text-amber-300 text-lg font-bold">
              ॥ गणपति बप्पा मोरया • महा घंटी नाद ॥
            </div>
            <h3 className="text-2xl sm:text-4xl font-serif-title font-bold text-amber-200 mb-1">
              {stage >= 10 ? '🎉 All 10 Stages Conquered!' : `Stage ${stage} Cleared!`}
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 max-w-md mb-4">
              {stage >= 10
                ? 'Mushak has rung all 10 Sacred Maha Ghanti Bells and entered the Supreme Siddhivinayak Temple! Lord Ganesha showers divine blessings!'
                : `Mushak rang the Maha Ghanti Bell and entered ${STAGE_CONFIGS[stage - 1]?.name || 'the Temple Sanctum'}!`}
            </p>

            <div className="bg-[#1E293B] border border-[#D4AF37]/50 rounded-2xl p-4 max-w-sm w-full mb-6 text-xs sm:text-sm space-y-2 shadow-xl">
              <div className="flex justify-between items-center text-amber-200">
                <span>Total Score:</span>
                <span className="font-bold text-xl text-amber-300">{score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-stone-300">
                <span>Modaks Offered:</span>
                <span className="font-bold text-white">{modaks}</span>
              </div>
              <div className="flex justify-between items-center text-stone-300">
                <span>Progress:</span>
                <span className="font-bold text-amber-300">Stage {stage} of 10</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {stage < 10 ? (
                <button
                  onClick={() => startLevel(stage + 1, true)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm flex items-center gap-1.5 transition shadow-lg hover:brightness-110 active:scale-95 cursor-pointer"
                >
                  <span>Next: Stage {stage + 1} ({STAGE_CONFIGS[stage]?.name || 'Next Sanctum'})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => startLevel(1, false)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 font-extrabold text-sm flex items-center gap-1.5 transition shadow-lg hover:brightness-110 active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Again from Stage 1</span>
                </button>
              )}

              <button
                onClick={handleSaveScore}
                disabled={scoreSaved}
                className="px-4 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-sm flex items-center gap-1.5 transition hover:bg-amber-400 cursor-pointer"
              >
                <Trophy className="w-4 h-4" />
                {scoreSaved ? 'Score Saved!' : 'Save Score'}
              </button>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'game_over' && (
          <div className="absolute inset-0 bg-[#060919]/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white z-20">
            <div className="text-5xl mb-2">🐭</div>
            <h3 className="text-3xl sm:text-4xl font-serif-title font-bold text-amber-300 mb-2">
              GAME OVER
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 max-w-sm mb-5">
              Mushak fell into the canal! Gather your devotion and try again!
            </p>
            <button
              onClick={() => startLevel(stage, false)}
              className="px-7 py-3 rounded-full bg-amber-500 text-stone-950 font-bold text-sm shadow-xl hover:bg-amber-400 active:scale-95 transition flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Stage {stage}</span>
            </button>
          </div>
        )}
      </div>

      {/* On-Screen Mobile Controls */}
      <div className="w-full bg-[#0F172A] border-x-4 border-b-4 border-[#D4AF37] rounded-b-2xl p-3 flex items-center justify-between gap-3 sm:hidden">
        <div className="flex items-center gap-2">
          <button
            onTouchStart={() => (keysRef.current.left = true)}
            onTouchEnd={() => (keysRef.current.left = false)}
            onMouseDown={() => (keysRef.current.left = true)}
            onMouseUp={() => (keysRef.current.left = false)}
            className="w-14 h-12 bg-[#1E293B] active:bg-[#334155] border border-[#D4AF37]/50 rounded-xl flex items-center justify-center text-amber-300 font-bold shadow-xs active:scale-95 transition"
            aria-label="Left"
          >
            <ArrowLeft className="w-6 h-6 stroke-[3]" />
          </button>
          <button
            onTouchStart={() => (keysRef.current.right = true)}
            onTouchEnd={() => (keysRef.current.right = false)}
            onMouseDown={() => (keysRef.current.right = true)}
            onMouseUp={() => (keysRef.current.right = false)}
            className="w-14 h-12 bg-[#1E293B] active:bg-[#334155] border border-[#D4AF37]/50 rounded-xl flex items-center justify-center text-amber-300 font-bold shadow-xs active:scale-95 transition"
            aria-label="Right"
          >
            <ArrowRight className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {hasTrishul && (
            <button
              onTouchStart={() => {
                keysRef.current.actionPressedThisFrame = true;
                keysRef.current.action = true;
              }}
              onTouchEnd={() => (keysRef.current.action = false)}
              onMouseDown={() => {
                keysRef.current.actionPressedThisFrame = true;
                keysRef.current.action = true;
              }}
              onMouseUp={() => (keysRef.current.action = false)}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 active:brightness-90 text-white font-bold text-xs border-2 border-sky-300 shadow-lg active:scale-95 flex flex-col items-center justify-center transition"
              aria-label="Zap"
            >
              <span className="text-base">⚡</span>
              <span className="text-[10px] leading-none">ZAP</span>
            </button>
          )}

          <button
            onTouchStart={() => {
              keysRef.current.jumpPressedThisFrame = true;
              keysRef.current.jump = true;
            }}
            onTouchEnd={() => (keysRef.current.jump = false)}
            onMouseDown={() => {
              keysRef.current.jumpPressedThisFrame = true;
              keysRef.current.jump = true;
            }}
            onMouseUp={() => (keysRef.current.jump = false)}
            className="w-16 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 active:brightness-90 text-stone-950 font-bold text-sm border-2 border-[#D4AF37] shadow-lg active:scale-95 flex flex-col items-center justify-center transition"
          >
            <ArrowUp className="w-6 h-6 stroke-[3]" />
            <span className="text-[10px] leading-none">{hasLotusGlide ? 'FLOAT' : 'JUMP'}</span>
          </button>
        </div>
      </div>

      {/* Feature Showcase Guide */}
      <div className="w-full mt-4 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-3 bg-[#0F172A] border border-[#D4AF37]/40 rounded-xl flex items-center gap-2.5 text-stone-200">
          <span className="text-2xl">⚡</span>
          <div>
            <div className="font-bold text-sky-300">Trishul Zap (Key X)</div>
            <div className="text-[11px] text-stone-400">Fire piercing lightning bolts at distant enemies</div>
          </div>
        </div>
        <div className="p-3 bg-[#0F172A] border border-[#D4AF37]/40 rounded-xl flex items-center gap-2.5 text-stone-200">
          <span className="text-2xl">🪷</span>
          <div>
            <div className="font-bold text-rose-300">Lotus Glide Canopy</div>
            <div className="text-[11px] text-stone-400">Hold Jump in mid-air to float gracefully on petals</div>
          </div>
        </div>
        <div className="p-3 bg-[#0F172A] border border-[#D4AF37]/40 rounded-xl flex items-center gap-2.5 text-stone-200">
          <span className="text-2xl">🛡️</span>
          <div>
            <div className="font-bold text-emerald-300">Kavach Shield</div>
            <div className="text-[11px] text-stone-400">Sudarshan Chakra absorbs 3 enemy collisions</div>
          </div>
        </div>
        <div className="p-3 bg-[#0F172A] border border-[#D4AF37]/40 rounded-xl flex items-center gap-2.5 text-stone-200">
          <span className="text-2xl">🥟</span>
          <div>
            <div className="font-bold text-amber-300">Luminous Modaks</div>
            <div className="text-[11px] text-stone-400">Shimmering celestial auras & rare divine power drops</div>
          </div>
        </div>
      </div>
                
        </div>
      </div>

        </div>
          {/* Universal Responsive Screen Handler */}
      <style>{`
        /* Hide completely on desktop screens */
        @media (min-width: 1024px) {
          .mobile-touch-bar {
            display: none !important;
          }
        }
        /* Force display on all mobile viewport phones turned horizontally */
        @media (max-width: 1023px) and (orientation: landscape) {
          .mobile-touch-bar {
            display: block !important;
          }
        }
        /* Standard vertical phone layout */
        @media (max-width: 767px) {
          .mobile-touch-bar {
            display: block !important;
          }
        }
      `}</style>

      </div>

    </div>
  );
};
