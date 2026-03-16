import {
  defineConfig,
  presetUno,
  presetIcons,
  presetAttributify,
  transformerDirectives
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true
    })
  ],
  transformers: [
    transformerDirectives()
  ],
  shortcuts: {
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    'flex-col-center': 'flex flex-col items-center justify-center',
    'glass': 'backdrop-blur-xl bg-white/5 border border-white/10',
    'glass-dark': 'backdrop-blur-xl bg-black/20 border border-white/5',
    'glow-green': 'shadow-[0_0_30px_rgba(193,255,114,0.3)]',
    'glow-blue': 'shadow-[0_0_30px_rgba(0,242,255,0.3)]',
    'glow-orange': 'shadow-[0_0_30px_rgba(255,92,0,0.3)]',
    'text-glow-green': 'text-[#C1FF72] drop-shadow-[0_0_10px_rgba(193,255,114,0.5)]',
    'text-glow-blue': 'text-[#00F2FF] drop-shadow-[0_0_10px_rgba(0,242,255,0.5)]'
  },
  theme: {
    colors: {
      night: {
        DEFAULT: '#0A0A0A',
        deep: '#050505',
        soft: '#1A1A1A',
        light: '#2A2A2A'
      },
      nebula: {
        DEFAULT: '#1A1A1A',
        dark: '#121212',
        light: '#252525'
      },
      energy: {
        green: '#C1FF72',
        'green-dim': '#8BC34A',
        blue: '#00F2FF',
        'blue-dim': '#00B8CC'
      },
      warning: {
        DEFAULT: '#FF5C00',
        dim: '#CC4A00',
        glow: '#FF8A33'
      },
      glass: {
        white: 'rgba(255, 255, 255, 0.05)',
        border: 'rgba(255, 255, 255, 0.1)',
        highlight: 'rgba(255, 255, 255, 0.15)'
      }
    },
    fontFamily: {
      mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'Consolas', 'monospace'],
      sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      serif: ['Noto Serif SC', 'Source Han Serif SC', 'serif']
    }
  },
  rules: [
    ['safe-area-top', { 'padding-top': 'env(safe-area-inset-top)' }],
    ['safe-area-bottom', { 'padding-bottom': 'env(safe-area-inset-bottom)' }],
    ['glass-panel', {
      'background': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      'backdrop-filter': 'blur(20px)',
      'border': '1px solid rgba(255,255,255,0.1)',
      'box-shadow': '0 8px 32px rgba(0,0,0,0.3)'
    }],
    ['energy-ring', {
      'border': '2px solid transparent',
      'background': 'linear-gradient(#0A0A0A, #0A0A0A) padding-box, linear-gradient(135deg, #C1FF72, #00F2FF) border-box',
      'border-radius': '50%'
    }],
    ['star-bg', {
      'background': 'radial-gradient(ellipse at center, #1A1A1A 0%, #0A0A0A 100%)'
    }],
    ['pulse-glow', {
      'animation': 'pulse-glow 2s ease-in-out infinite'
    }],
    ['float', {
      'animation': 'float 3s ease-in-out infinite'
    }],
    ['breathe', {
      'animation': 'breathe 4s ease-in-out infinite'
    }]
  ],
  safelist: [
    'text-energy-green',
    'text-energy-blue',
    'text-warning',
    'bg-night',
    'bg-nebula',
    'glass-panel'
  ]
})
