<template>
  <view class="capsule-page">
    <view class="page-header">
      <text class="page-title font-mono">情感包裹</text>
      <text class="page-subtitle">EMOTIONAL CAPSULES</text>
    </view>

    <view class="create-btn glass-panel" @click="createCapsule">
      <view class="btn-glow"></view>
      <text class="btn-icon">+</text>
      <text class="btn-text">创建新胶囊</text>
    </view>

    <view class="stats-row">
      <view class="stat-item glass-panel">
        <text class="stat-value font-mono glow-text-green">{{ capsuleStore.totalCapsules }}</text>
        <text class="stat-label">总数</text>
      </view>
      <view class="stat-item glass-panel">
        <text class="stat-value font-mono glow-text-blue">{{ capsuleStore.activeCapsules }}</text>
        <text class="stat-label">已封装</text>
      </view>
      <view class="stat-item glass-panel">
        <text class="stat-value font-mono glow-text-orange">{{ capsuleStore.draftCapsules }}</text>
        <text class="stat-label">草稿</text>
      </view>
    </view>

    <scroll-view class="capsule-list" scroll-y>
      <view 
        class="capsule-card" 
        v-for="(capsule, index) in capsuleStore.capsules" 
        :key="capsule.id"
        :style="{ transform: `translateY(${index * -20}rpx)`, zIndex: capsuleStore.capsules.length - index }"
        @click="viewCapsule(capsule)"
      >
        <view class="card-glow" :class="getStatusClass(capsule.status)"></view>
        <view class="card-content">
          <view class="card-header">
            <view class="capsule-icon-box" :class="getStatusClass(capsule.status)">
              <text class="capsule-icon">{{ getTypeIcon(capsule.type) }}</text>
            </view>
            <view class="capsule-info">
              <text class="capsule-name font-mono">{{ capsule.title }}</text>
              <text class="capsule-recipient">{{ getTriggerText(capsule) }}</text>
            </view>
            <view class="status-dot" :class="getStatusClass(capsule.status)"></view>
          </view>
          
          <view class="card-body">
            <view class="trigger-info">
              <text class="trigger-label">触发条件</text>
              <text class="trigger-value">{{ getTriggerCondition(capsule) }}</text>
            </view>
          </view>

          <view class="card-footer">
            <view class="encrypt-badge">
              <text class="encrypt-icon">🔐</text>
              <text class="encrypt-text">{{ getStatusText(capsule.status) }}</text>
            </view>
            <text class="created-date font-mono">{{ formatDate(capsule.createdAt) }}</text>
          </view>
        </view>

        <view class="particles" v-if="capsule.status === 'SEALED'">
          <view v-for="i in 6" :key="i" class="particle" :style="getParticleStyle(i)"></view>
        </view>
      </view>

      <view class="empty-state" v-if="capsuleStore.capsules.length === 0">
        <view class="empty-icon-box">
          <text class="empty-icon">📦</text>
        </view>
        <text class="empty-title">还没有创建胶囊</text>
        <text class="empty-hint">点击上方按钮创建你的第一个情感包裹</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useCapsuleStore } from '@/stores/capsule'
import type { Capsule, CapsuleStatus, CapsuleType, TriggerType } from '@/api/types'

const capsuleStore = useCapsuleStore()

onMounted(() => {
  capsuleStore.fetchCapsules()
})

const getParticleStyle = (index: number) => {
  const angle = (index / 6) * 360
  const delay = index * 0.5
  return {
    '--angle': `${angle}deg`,
    animationDelay: `${delay}s`
  }
}

const createCapsule = () => {
  uni.navigateTo({
    url: '/pages/capsule-creator/capsule-creator'
  })
}

const viewCapsule = (capsule: Capsule) => {
  const statusText = getStatusText(capsule.status)
  const triggerText = getTriggerCondition(capsule)
  
  uni.showModal({
    title: capsule.title,
    content: `状态: ${statusText}\n触发条件: ${triggerText}\n类型: ${capsule.type}`,
    showCancel: false
  })
}

const getStatusClass = (status: CapsuleStatus) => {
  const map: Record<CapsuleStatus, string> = {
    'DRAFT': 'draft',
    'SEALED': 'sealed',
    'SENT': 'sent'
  }
  return map[status] || 'draft'
}

const getStatusText = (status: CapsuleStatus) => {
  const map: Record<CapsuleStatus, string> = {
    'DRAFT': '草稿',
    'SEALED': '已加密',
    'SENT': '已送达'
  }
  return map[status] || '未知'
}

const getTypeIcon = (type: CapsuleType) => {
  const map: Record<CapsuleType, string> = {
    'TEXT': '📝',
    'IMAGE': '🖼',
    'VIDEO': '🎬'
  }
  return map[type] || '📦'
}

const getTriggerText = (capsule: Capsule) => {
  if (capsule.triggerType === 'TIME') {
    return '定时开启'
  }
  return '死信开关'
}

const getTriggerCondition = (capsule: Capsule) => {
  if (capsule.triggerType === 'TIME' && capsule.triggerDate) {
    return formatDate(capsule.triggerDate)
  }
  if (capsule.triggerType === 'INACTIVITY' && capsule.graceDays) {
    return `${capsule.graceDays}天未活动后开启`
  }
  return '未设置'
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
</script>

<style scoped>
.capsule-page {
  min-height: 100vh;
  background: radial-gradient(ellipse at center, #1A1A1A 0%, #0A0A0A 100%);
  padding: 80rpx 32rpx 32rpx;
}

.page-header {
  text-align: center;
  margin-bottom: 32rpx;
}

.page-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 4rpx;
  display: block;
}

.page-subtitle {
  font-size: 18rpx;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 4rpx;
  margin-top: 8rpx;
  display: block;
}

.create-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 32rpx;
  border-radius: 24rpx;
  margin-bottom: 32rpx;
  overflow: hidden;
}

.btn-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(193, 255, 114, 0.1) 0%, rgba(0, 242, 255, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.create-btn:active .btn-glow {
  opacity: 1;
}

.btn-icon {
  font-size: 36rpx;
  color: #C1FF72;
  font-weight: 300;
}

.btn-text {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 500;
}

.stats-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 24rpx 16rpx;
  border-radius: 16rpx;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 600;
  display: block;
}

.stat-label {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 8rpx;
  display: block;
}

.glow-text-green {
  color: #C1FF72;
  text-shadow: 0 0 20rpx rgba(193, 255, 114, 0.5);
}

.glow-text-blue {
  color: #00F2FF;
  text-shadow: 0 0 20rpx rgba(0, 242, 255, 0.5);
}

.glow-text-orange {
  color: #FF5C00;
  text-shadow: 0 0 20rpx rgba(255, 92, 0, 0.5);
}

.capsule-list {
  position: relative;
}

.capsule-card {
  position: relative;
  border-radius: 24rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
}

.card-glow {
  position: absolute;
  inset: -2rpx;
  border-radius: 26rpx;
  z-index: 0;
}

.card-glow.sealed {
  background: linear-gradient(135deg, rgba(193, 255, 114, 0.3) 0%, rgba(0, 242, 255, 0.3) 100%);
  box-shadow: 0 0 40rpx rgba(193, 255, 114, 0.2);
}

.card-glow.draft {
  background: linear-gradient(135deg, rgba(255, 92, 0, 0.3) 0%, rgba(255, 200, 0, 0.3) 100%);
}

.card-glow.sent {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
}

.card-content {
  position: relative;
  z-index: 1;
  background: rgba(10, 10, 10, 0.9);
  border-radius: 22rpx;
  padding: 24rpx;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.capsule-icon-box {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.capsule-icon-box.sealed {
  background: linear-gradient(135deg, rgba(193, 255, 114, 0.2) 0%, rgba(0, 242, 255, 0.2) 100%);
}

.capsule-icon-box.draft {
  background: rgba(255, 92, 0, 0.2);
}

.capsule-icon-box.sent {
  background: rgba(255, 255, 255, 0.1);
}

.capsule-icon {
  font-size: 32rpx;
}

.capsule-info {
  flex: 1;
}

.capsule-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #ffffff;
  display: block;
}

.capsule-recipient {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4rpx;
  display: block;
}

.status-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
}

.status-dot.sealed {
  background: #C1FF72;
  box-shadow: 0 0 10rpx #C1FF72;
}

.status-dot.draft {
  background: #FF5C00;
  box-shadow: 0 0 10rpx #FF5C00;
}

.status-dot.sent {
  background: rgba(255, 255, 255, 0.3);
}

.card-body {
  margin-bottom: 20rpx;
}

.trigger-info {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  padding: 16rpx;
}

.trigger-label {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.4);
  display: block;
}

.trigger-value {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
  display: block;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.encrypt-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.encrypt-icon {
  font-size: 20rpx;
}

.encrypt-text {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.4);
}

.created-date {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.3);
}

.particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  border-radius: 24rpx;
}

.particle {
  position: absolute;
  width: 4rpx;
  height: 4rpx;
  background: #C1FF72;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  animation: particle-float 3s ease-in-out infinite;
}

@keyframes particle-float {
  0% {
    transform: rotate(var(--angle)) translateX(0) scale(0);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: rotate(var(--angle)) translateX(200rpx) scale(1);
    opacity: 0;
  }
}

.empty-state {
  text-align: center;
  padding: 80rpx 0;
}

.empty-icon-box {
  width: 120rpx;
  height: 120rpx;
  margin: 0 auto 24rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  font-size: 48rpx;
  opacity: 0.5;
}

.empty-title {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.6);
  display: block;
}

.empty-hint {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.3);
  margin-top: 12rpx;
  display: block;
}
</style>
