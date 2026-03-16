<template>
  <view class="sentinel-pet" :class="petState">
    <view class="pet-container">
      <view class="aura-layer">
        <view class="aura aura-1" :style="auraStyle"></view>
        <view class="aura aura-2" :style="auraStyle"></view>
        <view class="aura aura-3" :style="auraStyle"></view>
      </view>

      <view class="core-body" :style="coreStyle">
        <view class="inner-glow"></view>
        <view class="geometric-shape">
          <view class="shape-ring ring-1"></view>
          <view class="shape-ring ring-2"></view>
          <view class="shape-ring ring-3"></view>
          <view class="core-center">
            <view class="eye left-eye" :class="{ 'eye-happy': petState === 'HAPPY' }">
              <view class="pupil"></view>
            </view>
            <view class="eye right-eye" :class="{ 'eye-happy': petState === 'HAPPY' }">
              <view class="pupil"></view>
            </view>
          </view>
        </view>
        <view class="particles">
          <view v-for="i in 12" :key="i" class="particle" :style="getParticleStyle(i)"></view>
        </view>
      </view>

      <view class="energy-particles" v-if="isFeeding">
        <view v-for="i in 20" :key="i" class="energy-particle" :style="getEnergyParticleStyle(i)"></view>
      </view>
    </view>

    <view class="speech-bubble" v-if="message" :class="{ 'typing': isTyping }">
      <text class="speech-text">{{ displayText }}</text>
      <view class="bubble-tail"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  state?: 'IDLE' | 'LISTENING' | 'HAPPY' | 'WEAK'
  message?: string
  energy?: number
  isFeeding?: boolean
}>()

const emit = defineEmits<{
  (e: 'animationEnd'): void
}>()

const petState = computed(() => props.state || 'IDLE')
const isTyping = ref(false)
const displayText = ref('')

const coreColor = computed(() => {
  const energy = props.energy || 100
  if (energy > 70) return { primary: '#C1FF72', secondary: '#00F2FF' }
  if (energy > 30) return { primary: '#00F2FF', secondary: '#FFD700' }
  return { primary: '#FF5C00', secondary: '#FF8C00' }
})

const coreStyle = computed(() => ({
  '--primary-color': coreColor.value.primary,
  '--secondary-color': coreColor.value.secondary,
}))

const auraStyle = computed(() => ({
  '--aura-color': coreColor.value.primary,
}))

watch(() => props.message, (newMsg) => {
  if (newMsg) {
    isTyping.value = true
    displayText.value = ''
    let index = 0
    const interval = setInterval(() => {
      if (index < newMsg.length) {
        displayText.value += newMsg[index]
        index++
      } else {
        clearInterval(interval)
        isTyping.value = false
        emit('animationEnd')
      }
    }, 50)
  }
})

function getParticleStyle(index: number) {
  const angle = (index / 12) * 360
  const delay = index * 0.2
  return {
    '--angle': `${angle}deg`,
    animationDelay: `${delay}s`,
    backgroundColor: coreColor.value.primary,
  }
}

function getEnergyParticleStyle(index: number) {
  const startX = Math.random() * 100
  const startY = 100 + Math.random() * 50
  const endX = 50 + (Math.random() - 0.5) * 30
  const endY = 50
  const delay = Math.random() * 0.5
  return {
    '--start-x': `${startX}%`,
    '--start-y': `${startY}%`,
    '--end-x': `${endX}%`,
    '--end-y': `${endY}%`,
    animationDelay: `${delay}s`,
  }
}
</script>

<style scoped>
.sentinel-pet {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.pet-container {
  position: relative;
  width: 300rpx;
  height: 300rpx;
}

.aura-layer {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.aura {
  position: absolute;
  border-radius: 50%;
  border: 2rpx solid var(--aura-color, #C1FF72);
  opacity: 0.3;
  animation: aura-pulse 3s ease-in-out infinite;
}

.aura-1 {
  width: 280rpx;
  height: 280rpx;
}

.aura-2 {
  width: 320rpx;
  height: 320rpx;
  animation-delay: 0.5s;
}

.aura-3 {
  width: 360rpx;
  height: 360rpx;
  animation-delay: 1s;
}

@keyframes aura-pulse {
  0%, 100% { transform: scale(1); opacity: 0.2; }
  50% { transform: scale(1.05); opacity: 0.4; }
}

.sentinel-pet.LISTENING .aura {
  animation: aura-listen 0.5s ease-in-out infinite;
}

@keyframes aura-listen {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.1); opacity: 0.6; }
}

.sentinel-pet.HAPPY .aura {
  animation: aura-happy 0.3s ease-in-out infinite;
  border-color: #C1FF72;
}

@keyframes aura-happy {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.2); opacity: 0.6; }
}

.sentinel-pet.WEAK .aura {
  opacity: 0.1;
  animation: none;
}

.core-body {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 160rpx;
  height: 160rpx;
  animation: breathe 4s ease-in-out infinite;
}

.sentinel-pet.LISTENING .core-body {
  animation: pulse-fast 0.8s ease-in-out infinite;
}

.sentinel-pet.HAPPY .core-body {
  animation: bounce 0.5s ease-in-out infinite;
}

.sentinel-pet.WEAK .core-body {
  animation: breathe-slow 6s ease-in-out infinite;
  filter: brightness(0.6);
}

@keyframes breathe {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.05); }
}

@keyframes pulse-fast {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.1); }
}

@keyframes bounce {
  0%, 100% { transform: translate(-50%, -50%) scale(1) translateY(0); }
  50% { transform: translate(-50%, -50%) scale(1.1) translateY(-10rpx); }
}

@keyframes breathe-slow {
  0%, 100% { transform: translate(-50%, -50%) scale(0.95); }
  50% { transform: translate(-50%, -50%) scale(1); }
}

.inner-glow {
  position: absolute;
  inset: -20rpx;
  background: radial-gradient(circle, var(--primary-color, #C1FF72) 0%, transparent 70%);
  opacity: 0.3;
  border-radius: 50%;
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.1); }
}

.geometric-shape {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(193, 255, 114, 0.2) 0%, rgba(0, 242, 255, 0.2) 100%);
  border-radius: 50%;
  border: 2rpx solid var(--primary-color, #C1FF72);
  display: flex;
  align-items: center;
  justify-content: center;
}

.shape-ring {
  position: absolute;
  border-radius: 50%;
  border: 1rpx solid var(--primary-color, #C1FF72);
  opacity: 0.5;
}

.ring-1 {
  inset: 10rpx;
  animation: ring-rotate 10s linear infinite;
}

.ring-2 {
  inset: 20rpx;
  animation: ring-rotate 15s linear infinite reverse;
}

.ring-3 {
  inset: 30rpx;
  animation: ring-rotate 20s linear infinite;
}

@keyframes ring-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.core-center {
  display: flex;
  gap: 20rpx;
}

.eye {
  width: 16rpx;
  height: 20rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  position: relative;
  box-shadow: 0 0 10rpx rgba(255, 255, 255, 0.5);
}

.pupil {
  position: absolute;
  width: 8rpx;
  height: 8rpx;
  background: #0A0A0A;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.eye-happy {
  height: 8rpx;
  border-radius: 0 0 10rpx 10rpx;
  background: var(--primary-color, #C1FF72);
}

.eye-happy .pupil {
  display: none;
}

.particles {
  position: absolute;
  inset: 0;
}

.particle {
  position: absolute;
  width: 4rpx;
  height: 4rpx;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  animation: particle-orbit 4s linear infinite;
}

@keyframes particle-orbit {
  from {
    transform: rotate(var(--angle)) translateX(80rpx);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  to {
    transform: rotate(var(--angle)) translateX(80rpx) rotate(calc(var(--angle) * -1));
    opacity: 0;
  }
}

.energy-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.energy-particle {
  position: absolute;
  width: 8rpx;
  height: 8rpx;
  background: #C1FF72;
  border-radius: 50%;
  animation: energy-flow 1s ease-out forwards;
  box-shadow: 0 0 10rpx #C1FF72;
}

@keyframes energy-flow {
  0% {
    left: var(--start-x);
    top: var(--start-y);
    opacity: 1;
    transform: scale(1);
  }
  100% {
    left: var(--end-x);
    top: var(--end-y);
    opacity: 0;
    transform: scale(0);
  }
}

.speech-bubble {
  position: absolute;
  top: -80rpx;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
  padding: 20rpx 30rpx;
  min-width: 200rpx;
  max-width: 400rpx;
  animation: bubble-fade-in 0.3s ease;
}

.speech-bubble.typing::after {
  content: '|';
  animation: cursor-blink 0.5s infinite;
  color: #C1FF72;
}

@keyframes bubble-fade-in {
  from { opacity: 0; transform: translateX(-50%) translateY(10rpx); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

@keyframes cursor-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.speech-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  white-space: pre-wrap;
}

.bubble-tail {
  position: absolute;
  bottom: -16rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 16rpx solid transparent;
  border-right: 16rpx solid transparent;
  border-top: 16rpx solid rgba(255, 255, 255, 0.1);
}
</style>
