<template>
  <view class="encryption-overlay" v-if="visible">
    <view class="encryption-modal glass-panel">
      <view class="digital-rain">
        <view 
          v-for="i in 20" 
          :key="i" 
          class="rain-column"
          :style="{ animationDelay: `${Math.random() * 2}s`, left: `${i * 5}%` }"
        >
          <text v-for="j in 15" :key="j" class="rain-char">{{ getRandomChar() }}</text>
        </view>
      </view>

      <view class="encryption-content">
        <view class="encryption-icon">
          <view class="key-icon" :class="{ 'key-animate': currentPhase !== 'idle' }">
            <text class="key-symbol">🔐</text>
          </view>
          <view class="orbit-ring"></view>
          <view class="orbit-ring ring-2"></view>
        </view>

        <text class="phase-title font-mono">{{ phaseTitle }}</text>
        <text class="phase-desc">{{ phaseDesc }}</text>

        <view class="progress-container">
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: progress + '%' }"></view>
            <view class="progress-glow" :style="{ width: progress + '%' }"></view>
          </view>
          <text class="progress-text font-mono">{{ Math.round(progress) }}%</text>
        </view>

        <view class="encryption-stats">
          <view class="stat-item">
            <text class="stat-label">算法</text>
            <text class="stat-value">AES-256-GCM</text>
          </view>
          <view class="stat-item">
            <text class="stat-label">密钥长度</text>
            <text class="stat-value">256 bit</text>
          </view>
          <view class="stat-item">
            <text class="stat-label">迭代次数</text>
            <text class="stat-value">100,000</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  visible: boolean
  progress: number
  phase: 'idle' | 'keygen' | 'encrypting' | 'uploading' | 'complete'
}>()

const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'

function getRandomChar() {
  return chars[Math.floor(Math.random() * chars.length)]
}

const phaseTitle = computed(() => {
  switch (props.phase) {
    case 'keygen':
      return '正在生成私钥...'
    case 'encrypting':
      return '正在进行量子级加密...'
    case 'uploading':
      return '正在上传加密数据...'
    case 'complete':
      return '加密完成'
    default:
      return '准备中...'
  }
})

const phaseDesc = computed(() => {
  switch (props.phase) {
    case 'keygen':
      return '使用 PBKDF2 算法派生 256 位对称密钥'
    case 'encrypting':
      return '使用 AES-256-GCM 算法加密内容'
    case 'uploading':
      return '安全传输加密数据到服务器'
    case 'complete':
      return '您的记忆已被安全封存'
    default:
      return ''
  }
})
</script>

<style scoped>
.encryption-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 10, 10, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.encryption-modal {
  width: 600rpx;
  padding: 60rpx 40rpx;
  border-radius: 32rpx;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
  border: 1px solid rgba(193, 255, 114, 0.2);
  position: relative;
  overflow: hidden;
}

.digital-rain {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  opacity: 0.15;
  pointer-events: none;
}

.rain-column {
  position: absolute;
  top: -100%;
  animation: rain-fall 3s linear infinite;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

@keyframes rain-fall {
  0% { transform: translateY(0); }
  100% { transform: translateY(200%); }
}

.rain-char {
  font-size: 20rpx;
  color: #C1FF72;
  font-family: monospace;
}

.encryption-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.encryption-icon {
  position: relative;
  width: 120rpx;
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
}

.key-icon {
  width: 80rpx;
  height: 80rpx;
  background: rgba(193, 255, 114, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.key-icon.key-animate {
  animation: key-pulse 1s ease-in-out infinite;
}

@keyframes key-pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 20rpx rgba(193, 255, 114, 0.3); }
  50% { transform: scale(1.1); box-shadow: 0 0 40rpx rgba(193, 255, 114, 0.5); }
}

.key-symbol {
  font-size: 40rpx;
}

.orbit-ring {
  position: absolute;
  width: 100rpx;
  height: 100rpx;
  border: 1px solid rgba(193, 255, 114, 0.3);
  border-radius: 50%;
  animation: orbit-spin 4s linear infinite;
}

.orbit-ring::after {
  content: '';
  position: absolute;
  width: 10rpx;
  height: 10rpx;
  background: #C1FF72;
  border-radius: 50%;
  top: -5rpx;
  left: 50%;
  transform: translateX(-50%);
}

.ring-2 {
  width: 140rpx;
  height: 140rpx;
  animation-duration: 6s;
  animation-direction: reverse;
  border-color: rgba(0, 242, 255, 0.3);
}

.ring-2::after {
  background: #00F2FF;
}

@keyframes orbit-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.phase-title {
  font-size: 32rpx;
  color: #C1FF72;
  font-weight: 600;
  margin-bottom: 12rpx;
  text-align: center;
}

.phase-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 40rpx;
  text-align: center;
}

.progress-container {
  width: 100%;
  margin-bottom: 32rpx;
}

.progress-bar {
  width: 100%;
  height: 12rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6rpx;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #C1FF72, #00F2FF);
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.progress-glow {
  position: absolute;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: progress-shimmer 1.5s infinite;
}

@keyframes progress-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-text {
  display: block;
  text-align: center;
  margin-top: 16rpx;
  font-size: 28rpx;
  color: #C1FF72;
}

.encryption-stats {
  display: flex;
  justify-content: space-around;
  width: 100%;
  padding-top: 24rpx;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.stat-label {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.4);
}

.stat-value {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
  font-family: monospace;
}
</style>
