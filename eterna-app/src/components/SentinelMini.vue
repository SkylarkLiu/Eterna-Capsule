<template>
  <view class="sentinel-container">
    <view class="sentinel-body" :class="{ 'animate-acknowledge': isAcknowledging }">
      <view class="aura-ring"></view>
      <view class="aura-ring ring-2"></view>
      <view class="aura-ring ring-3"></view>
      
      <view class="sentinel-core">
        <view class="core-glow"></view>
        <view class="core-inner">
          <view class="eye left-eye">
            <view class="pupil" :class="{ 'pupil-happy': isHappy }"></view>
          </view>
          <view class="eye right-eye">
            <view class="pupil" :class="{ 'pupil-happy': isHappy }"></view>
          </view>
        </view>
      </view>
      
      <view class="wing left-wing"></view>
      <view class="wing right-wing"></view>
      
      <view class="tail-particles">
        <view v-for="i in 8" :key="i" class="tail-particle" :style="getTailStyle(i)"></view>
      </view>
    </view>
    
    <view class="sentinel-shadow"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  isComplete?: boolean
  isAcknowledging?: boolean
}>()

const isHappy = ref(false)

watch(() => props.isComplete, (newVal) => {
  if (newVal) {
    isHappy.value = true
  } else {
    isHappy.value = false
  }
})

watch(() => props.isAcknowledging, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      isHappy.value = false
    }, 2000)
  }
})

function getTailStyle(index: number) {
  const angle = (index / 8) * 360
  const delay = index * 0.15
  return {
    '--angle': `${angle}deg`,
    animationDelay: `${delay}s`
  }
}
</script>

<style scoped>
.sentinel-container {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sentinel-body {
  position: relative;
  width: 120rpx;
  height: 120rpx;
  animation: float 4s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20rpx); }
}

.sentinel-body.animate-acknowledge {
  animation: acknowledge 0.6s ease-in-out;
}

@keyframes acknowledge {
  0% { transform: translateY(0) scale(1); }
  30% { transform: translateY(-30rpx) scale(1.1); }
  60% { transform: translateY(-10rpx) scale(1.05); }
  100% { transform: translateY(0) scale(1); }
}

.aura-ring {
  position: absolute;
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(193, 255, 114, 0.3);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse-ring 3s ease-in-out infinite;
}

.ring-2 {
  width: 180rpx;
  height: 180rpx;
  border-color: rgba(0, 242, 255, 0.2);
  animation-delay: 0.5s;
}

.ring-3 {
  width: 200rpx;
  height: 200rpx;
  border-color: rgba(193, 255, 114, 0.1);
  animation-delay: 1s;
}

@keyframes pulse-ring {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
}

.sentinel-core {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(193, 255, 114, 0.3) 0%, rgba(0, 242, 255, 0.3) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 40rpx rgba(193, 255, 114, 0.3);
}

.core-glow {
  position: absolute;
  width: 140rpx;
  height: 140rpx;
  background: radial-gradient(circle, rgba(193, 255, 114, 0.4) 0%, transparent 70%);
  border-radius: 50%;
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.2); opacity: 1; }
}

.core-inner {
  width: 80rpx;
  height: 60rpx;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.eye {
  width: 20rpx;
  height: 24rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 10rpx rgba(255, 255, 255, 0.5);
}

.pupil {
  position: absolute;
  width: 10rpx;
  height: 10rpx;
  background: #0A0A0A;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
}

.pupil-happy {
  width: 16rpx;
  height: 6rpx;
  border-radius: 0 0 10rpx 10rpx;
  background: #C1FF72;
  transform: translate(-50%, -30%);
}

.wing {
  position: absolute;
  width: 40rpx;
  height: 60rpx;
  background: linear-gradient(180deg, rgba(193, 255, 114, 0.4) 0%, transparent 100%);
  border-radius: 50% 50% 0 0;
  top: 10rpx;
  animation: wing-flap 2s ease-in-out infinite;
}

.left-wing {
  left: -20rpx;
  transform-origin: right bottom;
  transform: rotate(-30deg);
}

.right-wing {
  right: -20rpx;
  transform-origin: left bottom;
  transform: rotate(30deg);
  animation-delay: 0.1s;
}

@keyframes wing-flap {
  0%, 100% { transform: rotate(-30deg); }
  50% { transform: rotate(-10deg); }
}

.tail-particles {
  position: absolute;
  bottom: -10rpx;
  left: 50%;
  transform: translateX(-50%);
}

.tail-particle {
  position: absolute;
  width: 6rpx;
  height: 6rpx;
  background: #C1FF72;
  border-radius: 50%;
  animation: tail-float 2s ease-in-out infinite;
}

@keyframes tail-float {
  0% {
    transform: rotate(var(--angle)) translateX(0) scale(0);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: rotate(var(--angle)) translateX(60rpx) scale(1);
    opacity: 0;
  }
}

.sentinel-shadow {
  position: absolute;
  bottom: -40rpx;
  width: 80rpx;
  height: 20rpx;
  background: radial-gradient(ellipse, rgba(0, 0, 0, 0.3) 0%, transparent 70%);
  animation: shadow-pulse 4s ease-in-out infinite;
}

@keyframes shadow-pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(0.8); opacity: 0.3; }
}
</style>
