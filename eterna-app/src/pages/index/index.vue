<template>
  <view class="index-page">
    <view class="stars-bg">
      <view v-for="i in 20" :key="i" class="star" :style="getStarStyle(i)"></view>
    </view>
    
    <view class="header">
      <text class="title font-mono">永恒胶囊</text>
      <text class="subtitle">ETERNA CAPSULE</text>
    </view>

    <SentinelStatus v-if="userStore.isLoggedIn" />

    <view class="sentinel-container" v-else>
      <view class="energy-ring" :style="ringStyle">
        <view class="ring-glow"></view>
      </view>
      
      <view class="sentinel-core" :class="energyPulseClass">
        <view class="sentinel-avatar">
          <text class="avatar-symbol">{{ sentinelStore.symbol }}</text>
        </view>
        <view class="breath-ring"></view>
        <view class="breath-ring delay-1"></view>
        <view class="breath-ring delay-2"></view>
      </view>

      <view class="energy-display">
        <text class="energy-value font-mono" :class="energyTextClass">{{ sentinelStore.energy }}%</text>
        <text class="energy-label">生命能量</text>
      </view>
    </view>

    <view class="sentinel-info glass-panel">
      <view class="info-row">
        <text class="info-label">守护者</text>
        <text class="info-value font-mono">{{ sentinelStore.name }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">共生天数</text>
        <text class="info-value font-mono glow-text-green">{{ sentinelStore.symbiosisDays }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">状态</text>
        <text class="info-value" :class="statusClass">{{ statusText }}</text>
      </view>
    </view>

    <view class="message-bubble glass-panel" v-if="sentinelStore.currentMessage">
      <text class="message-text font-serif">{{ sentinelStore.currentMessage }}</text>
    </view>

    <view class="quick-actions">
      <view class="action-btn glass-panel" @click="navigateToSentinel">
        <text class="action-icon">🕹️</text>
        <text class="action-text">互动</text>
      </view>
      <view class="action-btn glass-panel" @click="navigateToCapsule">
        <text class="action-icon">💊</text>
        <text class="action-text">胶囊</text>
      </view>
      <view class="action-btn glass-panel" @click="feedSentinel">
        <text class="action-icon">🍗</text>
        <text class="action-text">喂食</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useSentinelStore } from '@/stores/sentinel'
import { useUserStore } from '@/stores/user'
import SentinelStatus from '@/components/SentinelStatus.vue'

const sentinelStore = useSentinelStore()
const userStore = useUserStore()

let heartbeatTimer: number | null = null

const ringStyle = computed(() => {
  const energy = sentinelStore.energy
  const dashArray = (energy / 100) * 283
  const color = energy > 70 ? '#C1FF72' : energy > 30 ? '#00F2FF' : '#FF5C00'
  return {
    strokeDasharray: `${dashArray} 283`,
    stroke: color,
    filter: `drop-shadow(0 0 10px ${color})`
  }
})

const energyPulseClass = computed(() => {
  const energy = sentinelStore.energy
  if (energy > 70) return 'pulse-green'
  if (energy > 30) return 'pulse-blue'
  return 'pulse-orange'
})

const energyTextClass = computed(() => {
  const energy = sentinelStore.energy
  if (energy > 70) return 'glow-text-green'
  if (energy > 30) return 'glow-text-blue'
  return 'glow-text-orange'
})

const statusClass = computed(() => {
  const energy = sentinelStore.energy
  if (energy > 70) return 'glow-text-green'
  if (energy > 30) return 'glow-text-blue'
  return 'glow-text-orange'
})

const statusText = computed(() => {
  const energy = sentinelStore.energy
  if (energy > 70) return '活力充沛'
  if (energy > 30) return '能量平稳'
  return '需要关注'
})

const getStarStyle = (index: number) => {
  const top = Math.random() * 100
  const left = Math.random() * 100
  const size = Math.random() * 2 + 1
  const delay = Math.random() * 3
  return {
    top: `${top}%`,
    left: `${left}%`,
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `${delay}s`
  }
}

const navigateToSentinel = () => {
  uni.switchTab({ url: '/pages/sentinel/sentinel' })
}

const navigateToCapsule = () => {
  uni.switchTab({ url: '/pages/capsule/capsule' })
}

const feedSentinel = () => {
  sentinelStore.feed()
  uni.showToast({
    title: '守护兽很开心！',
    icon: 'none'
  })
}

function startAutoHeartbeat() {
  if (!userStore.isLoggedIn) return
  
  userStore.sendHeartbeat()
  
  heartbeatTimer = setInterval(() => {
    if (userStore.isLoggedIn) {
      userStore.sendHeartbeat()
    }
  }, 5 * 60 * 1000)
}

function stopAutoHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}

onMounted(() => {
  userStore.init()
  
  if (userStore.isLoggedIn) {
    userStore.fetchCurrentUser()
    startAutoHeartbeat()
  }
})

onUnmounted(() => {
  stopAutoHeartbeat()
})
</script>

<style scoped>
.index-page {
  min-height: 100vh;
  background: radial-gradient(ellipse at center, #1A1A1A 0%, #0A0A0A 100%);
  padding: 80rpx 40rpx 40rpx;
  position: relative;
  overflow: hidden;
}

.stars-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.star {
  position: absolute;
  background: #ffffff;
  border-radius: 50%;
  animation: twinkle 3s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.8; }
}

.header {
  text-align: center;
  margin-bottom: 40rpx;
  position: relative;
  z-index: 1;
}

.title {
  font-size: 48rpx;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 8rpx;
  display: block;
}

.subtitle {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 6rpx;
  margin-top: 12rpx;
  display: block;
}

.sentinel-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  margin-bottom: 40rpx;
}

.energy-ring {
  width: 320rpx;
  height: 320rpx;
  border-radius: 50%;
  border: 3px solid transparent;
  background: linear-gradient(#0A0A0A, #0A0A0A) padding-box,
              linear-gradient(135deg, #C1FF72, #00F2FF) border-box;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 40px rgba(193, 255, 114, 0.2);
}

.ring-glow {
  position: absolute;
  inset: -10rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(193, 255, 114, 0.1) 0%, transparent 70%);
  animation: pulse-glow 3s ease-in-out infinite;
}

.sentinel-core {
  width: 280rpx;
  height: 280rpx;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle, #1A1A1A 0%, #0A0A0A 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.sentinel-core.pulse-green {
  box-shadow: 0 0 60rpx rgba(193, 255, 114, 0.3);
}

.sentinel-core.pulse-blue {
  box-shadow: 0 0 60rpx rgba(0, 242, 255, 0.3);
}

.sentinel-core.pulse-orange {
  box-shadow: 0 0 60rpx rgba(255, 92, 0, 0.3);
}

.sentinel-avatar {
  position: relative;
  z-index: 2;
}

.avatar-symbol {
  font-size: 100rpx;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 0 30px rgba(193, 255, 114, 0.5);
  animation: float 4s ease-in-out infinite;
}

.breath-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 1px solid rgba(193, 255, 114, 0.3);
  animation: breathe 4s ease-in-out infinite;
}

.breath-ring.delay-1 {
  animation-delay: 1s;
}

.breath-ring.delay-2 {
  animation-delay: 2s;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8rpx); }
}

@keyframes breathe {
  0%, 100% { 
    transform: scale(1); 
    opacity: 0.5;
  }
  50% { 
    transform: scale(1.2); 
    opacity: 0;
  }
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

.energy-display {
  text-align: center;
  margin-top: 30rpx;
}

.energy-value {
  font-size: 56rpx;
  font-weight: 600;
  display: block;
}

.energy-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 8rpx;
  display: block;
}

.sentinel-info {
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.5);
}

.info-value {
  font-size: 26rpx;
  color: #ffffff;
}

.message-bubble {
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 40rpx;
}

.message-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.8;
}

.quick-actions {
  display: flex;
  justify-content: space-around;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28rpx 0;
  border-radius: 20rpx;
}

.action-icon {
  font-size: 36rpx;
  color: #C1FF72;
  margin-bottom: 12rpx;
}

.action-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}
</style>
