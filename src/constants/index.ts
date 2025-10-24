// Flow modes
export const FLOW_MODES = {
  SMOOTH: 'smooth',
  CRAWL: 'crawl',
  DYNAMIC: 'dynamic',
} as const

export const FLOW_MODE_LABELS = {
  [FLOW_MODES.SMOOTH]: 'Плавный поток',
  [FLOW_MODES.CRAWL]: 'Звёздные войны',
  [FLOW_MODES.DYNAMIC]: 'Динамика',
} as const

export const FLOW_MODE_DESCRIPTIONS = {
  [FLOW_MODES.SMOOTH]: 'Медитативное течение',
  [FLOW_MODES.CRAWL]: 'Эпическая прокрутка',
  [FLOW_MODES.DYNAMIC]: 'Активные паттерны',
} as const

export const FLOW_MODE_ICONS = {
  [FLOW_MODES.SMOOTH]: '🌊',
  [FLOW_MODES.CRAWL]: '⭐',
  [FLOW_MODES.DYNAMIC]: '🌀',
} as const

// Sub modes
export const SUB_MODES = {
  SPIRAL: 'spiral',
  WAVES: 'waves',
  VORTEX: 'vortex',
} as const

export const SUB_MODE_LABELS = {
  [SUB_MODES.SPIRAL]: 'Спираль',
  [SUB_MODES.WAVES]: 'Волны',
  [SUB_MODES.VORTEX]: 'Вихрь',
} as const

export const SUB_MODE_ICONS = {
  [SUB_MODES.SPIRAL]: '🌀',
  [SUB_MODES.WAVES]: '🌊',
  [SUB_MODES.VORTEX]: '🌪️',
} as const

// Sound types
export const SOUND_TYPES = {
  NONE: 'none',
  THETA: 'theta',
  WHITE_NOISE: 'white_noise',
  RAIN: 'rain',
  OCEAN: 'ocean',
} as const

export const SOUND_LABELS = {
  [SOUND_TYPES.NONE]: 'Без звука',
  [SOUND_TYPES.THETA]: 'Тета-волны',
  [SOUND_TYPES.WHITE_NOISE]: 'Белый шум',
  [SOUND_TYPES.RAIN]: 'Дождь',
  [SOUND_TYPES.OCEAN]: 'Океан',
} as const

export const SOUND_DESCRIPTIONS = {
  [SOUND_TYPES.NONE]: 'Тишина',
  [SOUND_TYPES.THETA]: 'Для медитации',
  [SOUND_TYPES.WHITE_NOISE]: 'Для концентрации',
  [SOUND_TYPES.RAIN]: 'Для релаксации',
  [SOUND_TYPES.OCEAN]: 'Для глубокого погружения',
} as const

// Performance presets
export const PERFORMANCE_PRESETS = {
  ECO: { value: 500, label: 'Эко', icon: '🐢', color: '#4caf50' },
  BALANCED: { value: 1000, label: 'Баланс', icon: '⚡', color: '#ff9800' },
  MAX: { value: 1500, label: 'Макс', icon: '🚀', color: '#f44336' },
} as const

// Special modes
export const SPECIAL_MODES = {
  MEDITATION: 'meditation',
  FOCUS: 'focus',
  CREATIVE: 'creative',
  AUDIO: 'audio',
} as const

export const SPECIAL_MODE_LABELS = {
  [SPECIAL_MODES.MEDITATION]: 'Медитация',
  [SPECIAL_MODES.FOCUS]: 'Фокус',
  [SPECIAL_MODES.CREATIVE]: 'Творчество',
  [SPECIAL_MODES.AUDIO]: 'Аудио',
} as const

export const SPECIAL_MODE_ICONS = {
  [SPECIAL_MODES.MEDITATION]: '🕯️',
  [SPECIAL_MODES.FOCUS]: '🍅',
  [SPECIAL_MODES.CREATIVE]: '🎨',
  [SPECIAL_MODES.AUDIO]: '🎤',
} as const

export const SPECIAL_MODE_COLORS = {
  [SPECIAL_MODES.MEDITATION]: '#4caf50',
  [SPECIAL_MODES.FOCUS]: '#f44336',
  [SPECIAL_MODES.CREATIVE]: '#9c27b0',
  [SPECIAL_MODES.AUDIO]: '#ff9800',
} as const

// Animation durations
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  SLOWER: 700,
} as const

// Breakpoints
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const

// Z-index layers
export const Z_INDEX = {
  BACKGROUND: 0,
  PARTICLES: 10,
  CONTENT: 20,
  UI: 30,
  MODAL: 40,
  TOAST: 50,
} as const

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  SPACE: 'Space',
  ESCAPE: 'Escape',
  OPEN_SETTINGS: 'KeyO',
  TOGGLE_SOUND: 'KeyM',
  NEXT_MODE: 'ArrowRight',
  PREV_MODE: 'ArrowLeft',
  INCREASE_SPEED: 'ArrowUp',
  DECREASE_SPEED: 'ArrowDown',
} as const

// Default settings
export const DEFAULT_SETTINGS = {
  mode: FLOW_MODES.SMOOTH,
  subMode: SUB_MODES.SPIRAL,
  baseSpeed: 1.0,
  sound: SOUND_TYPES.NONE,
  flickerSize: true,
  flickerAlpha: true,
  showTrails: true,
  particleCount: PERFORMANCE_PRESETS.BALANCED.value,
} as const

// Local storage keys
export const STORAGE_KEYS = {
  SETTINGS: 'flow-settings',
  THEME: 'flow-theme',
  ONBOARDING_COMPLETED: 'flow-onboarding-completed',
} as const
