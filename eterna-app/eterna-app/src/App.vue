<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('永恒胶囊 启动')
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Noto+Serif+SC:wght@400;500;600&display=swap');

page {
  background-color: #0A0A0A;
  font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #FFFFFF;
  min-height: 100vh;
}

.container {
  padding: 20rpx;
}

@keyframes pulse-glow {
  0%, 100% {
    filter: drop-shadow(0 0 20px rgba(193, 255, 114, 0.3));
  }
  50% {
    filter: drop-shadow(0 0 40px rgba(193, 255, 114, 0.6));
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes breathe {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}

@keyframes rotate-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}

@keyframes ripple {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.font-mono {
  font-family: 'JetBrains Mono', 'SF Mono', Monaco, Consolas, monospace;
}

.font-serif {
  font-family: 'Noto Serif SC', 'Source Han Serif SC', serif;
}

.glass-panel {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.glow-text-green {
  color: #C1FF72;
  text-shadow: 0 0 20px rgba(193, 255, 114, 0.5);
}

.glow-text-blue {
  color: #00F2FF;
  text-shadow: 0 0 20px rgba(0, 242, 255, 0.5);
}

.glow-text-orange {
  color: #FF5C00;
  text-shadow: 0 0 20px rgba(255, 92, 0, 0.5);
}
</style>
