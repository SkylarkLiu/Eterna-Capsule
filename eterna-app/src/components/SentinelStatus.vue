<template>
  <view class="sentinel-status" :class="healthStatus">
    <view class="sentinel-container">
      <view class="aura-ring" :class="healthStatus"></view>
      <view class="aura-ring ring-2" :class="healthStatus"></view>
      <view class="aura-ring ring-3" :class="healthStatus"></view>
      
      <view class="sentinel-body" :class="{ 'animate-happy': isHappy, 'animate-anxious': isAnxious }">
        <view class="core-glow" :class="healthStatus"></view>
        <view class="sentinel-core">
          <view class="eye left-eye">
            <view class="pupil" :class="{ 'pupil-happy': isHappy }"></view>
          </view>
          <view class="eye right-eye">
            <view class="pupil" :class="{ 'pupil-happy': isHappy }"></view>
          </view>
        </view>
        <view class="wing left-wing" :class="healthStatus"></view>
        <view class="wing right-wing" :class="healthStatus"></view>
      </view>
    </view>

    <view class="hourglass-container">
      <view class="hourglass">
        <view class="hourglass-top">
          <view class="sand" :style="{ height: sandPercentage + '%' }"></view>
        </view>
        <view class="hourglass-neck">
          <view class="sand-fall" v-if="sandPercentage > 0 && sandPercentage < 100"></view>
        </view>
        <view class="hourglass-bottom">
          <view class="sand" :style="{ height: (100 - sandPercentage) + '%' }"></view>
        </view>
      </view>
    </view>

    <view class="status-info">
      <text class="status-title font-mono">生命沙漏</text>
      <text class="status-desc" v-if="timeUntilTrigger">
        信使将在 {{ timeUntilTrigger.hours }}小时{{ timeUntilTrigger.minutes }}分后出发
      </text>
      <text class="status-desc" v-else>
        守护兽正在守护你的记忆
      </text>
    </view>

    <button class="heartbeat-btn" @click="handleHeartbeat" :disabled="isBeating">
      <view class="btn-glow" v-if="isBeating"></view>
      <text class="btn-text">{{ isBeating ? '确认中...' : '我在' }}</text>
    </button>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const isBeating = ref(false)
const isHappy = ref(false)
const isAnxious = ref(false)
let updateTimer: number | null = null

const healthStatus = computed(() => userStore.getHeartbeatHealthStatus())

const timeUntilTrigger = computed(() => userStore.getTimeUntilTrigger())

const sandPercentage = computed(() => {
  if (!userStore.lastHeartbeatAt || !userStore.heartbeatGraceDays) return 50
  
  const lastHeartbeat = userStore.lastHeartbeatAt.getTime()
  const graceMs = userStore.heartbeatGraceDays * 24 * 60 * 60 * 1000
  const now = Date.now()
  const elapsed = now - lastHeartbeat
  const percentage = (elapsed / graceMs) * 100
  
  return Math.min(100, Math.max(0, percentage))
})

async function handleHeartbeat() {
  if (isBeating.value) return
  
  isBeating.value = true
  
  const result = await userStore.sendHeartbeat()
  
  if (result.success) {
    isHappy.value = true
    setTimeout(() => {
      isHappy.value = false
    }, 3000)
    
    uni.showToast({
      title: '守护兽感受到你的存在',
      icon: 'success',
    })
  } else {
    uni.showToast({
      title: '心跳发送失败',
      icon: 'none',
    })
  }
  
  isBeating.value = false
}

function updateAnxiousState() {
  isAnxious.value = healthStatus.value === 'warning' || healthStatus.value === 'critical'
}

onMounted(() => {
  updateAnxiousState()
  updateTimer = setInterval(() => {
    updateAnxiousState()
  }, 60000)
})

onUnmounted(() => {
  if (updateTimer) {
    clearInterval(updateTimer)
  }
})
</script>

<style scoped>
.sentinel-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 32rpx;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.sentinel-status.warning {
  border-color: rgba(255, 92, 0, 0.3);
}

.sentinel-status.critical {
  border-color: rgba(255, 92, 0, 0.5);
}

.sentinel-container {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
}

.aura-ring {
  position: absolute;
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(193, 255, 114, 0.3);
  animation: pulse-ring 3s ease-in-out infinite;
}

.aura-ring.healthy {
  border-color: rgba(193, 255, 114, 0.3);
}

.aura-ring.warning {
  border-color: rgba(255, 92, 0, 0.4);
}

.aura-ring.critical {
  border-color: rgba(255, 92, 0, 0.6);
  animation: pulse-ring-fast 1s ease-in-out infinite;
}

.ring-2 {
  width: 220rpx;
  height: 220rpx;
  animation-delay: 0.5s;
}

.ring-3 {
  width: 260rpx;
  height: 260rpx;
  animation-delay: 1s;
}

@keyframes pulse-ring {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 1; }
}

@keyframes pulse-ring-fast {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.15); opacity: 1; }
}

.sentinel-body {
  position: relative;
  width: 100rpx;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: float 4s ease-in-out infinite;
}

.sentinel-body.animate-happy {
  animation: happy-bounce 0.5s ease-in-out 3;
}

.sentinel-body.animate-anxious {
  animation: anxious-shake 0.5s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15rpx); }
}

@keyframes happy-bounce {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-30rpx) scale(1.1); }
}

@keyframes anxious-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5rpx); }
  75% { transform: translateX(5rpx); }
}

.core-glow {
  position: absolute;
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(193, 255, 114, 0.4) 0%, transparent 70%);
  animation: glow-pulse 2s ease-in-out infinite;
}

.core-glow.healthy {
  background: radial-gradient(circle, rgba(193, 255, 114, 0.4) 0%, transparent 70%);
}

.core-glow.warning {
  background: radial-gradient(circle, rgba(255, 200, 0, 0.4) 0%, transparent 70%);
}

.core-glow.critical {
  background: radial-gradient(circle, rgba(255, 92, 0, 0.5) 0%, transparent 70%);
}

@keyframes glow-pulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.2); opacity: 1; }
}

.sentinel-core {
  width: 60rpx;
  height: 40rpx;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 30rpx;
  padding: 10rpx 15rpx;
}

.eye {
  width: 16rpx;
  height: 20rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  position: relative;
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
  transition: all 0.3s ease;
}

.pupil-happy {
  width: 12rpx;
  height: 4rpx;
  border-radius: 0 0 6rpx 6rpx;
  background: #C1FF72;
  transform: translate(-50%, -30%);
}

.wing {
  position: absolute;
  width: 30rpx;
  height: 50rpx;
  background: linear-gradient(180deg, rgba(193, 255, 114, 0.3) 0%, transparent 100%);
  border-radius: 50% 50% 0 0;
  top: 5rpx;
  animation: wing-flap 2s ease-in-out infinite;
}

.wing.healthy {
  background: linear-gradient(180deg, rgba(193, 255, 114, 0.3) 0%, transparent 100%);
}

.wing.warning {
  background: linear-gradient(180deg, rgba(255, 200, 0, 0.3) 0%, transparent 100%);
}

.wing.critical {
  background: linear-gradient(180deg, rgba(255, 92, 0, 0.4) 0%, transparent 100%);
  animation: wing-flap-fast 0.5s ease-in-out infinite;
}

.left-wing {
  left: -15rpx;
  transform-origin: right bottom;
  transform: rotate(-30deg);
}

.right-wing {
  right: -15rpx;
  transform-origin: left bottom;
  transform: rotate(30deg);
  animation-delay: 0.1s;
}

@keyframes wing-flap {
  0%, 100% { transform: rotate(-30deg); }
  50% { transform: rotate(-10deg); }
}

@keyframes wing-flap-fast {
  0%, 100% { transform: rotate(-30deg); }
  50% { transform: rotate(-5deg); }
}

.hourglass-container {
  margin-bottom: 24rpx;
}

.hourglass {
  width: 60rpx;
  height: 100rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hourglass-top,
.hourglass-bottom {
  width: 50rpx;
  height: 40rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.hourglass-top {
  border-radius: 25rpx 25rpx 0 0;
  border-bottom: none;
}

.hourglass-bottom {
  border-radius: 0 0 25rpx 25rpx;
  border-top: none;
}

.hourglass-neck {
  width: 10rpx;
  height: 10rpx;
  background: rgba(255, 255, 255, 0.1);
  position: relative;
}

.sand {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, #C1FF72 0%, #00F2FF 100%);
  transition: height 0.5s ease;
}

.hourglass-top .sand {
  top: 0;
  bottom: auto;
}

.sand-fall {
  position: absolute;
  width: 4rpx;
  height: 10rpx;
  background: #C1FF72;
  left: 50%;
  transform: translateX(-50%);
  animation: sand-fall-anim 1s ease-in-out infinite;
}

@keyframes sand-fall-anim {
  0% { opacity: 1; transform: translateX(-50%) translateY(0); }
  100% { opacity: 0; transform: translateX(-50%) translateY(10rpx); }
}

.status-info {
  text-align: center;
  margin-bottom: 32rpx;
}

.status-title {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 600;
  display: block;
  margin-bottom: 8rpx;
}

.status-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
  display: block;
}

.heartbeat-btn {
  position: relative;
  width: 200rpx;
  height: 80rpx;
  background: linear-gradient(135deg, rgba(193, 255, 114, 0.2) 0%, rgba(0, 242, 255, 0.2) 100%);
  border: 1px solid rgba(193, 255, 114, 0.3);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.heartbeat-btn[disabled] {
  opacity: 0.6;
}

.btn-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(193, 255, 114, 0.4), transparent);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.btn-text {
  font-size: 28rpx;
  color: #C1FF72;
  font-weight: 500;
  position: relative;
  z-index: 1;
}
</style>
