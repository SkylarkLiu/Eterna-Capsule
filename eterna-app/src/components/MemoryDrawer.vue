<template>
  <view class="memory-drawer" :class="{ 'drawer-open': isOpen }">
    <view class="drawer-backdrop" @click="$emit('close')"></view>
    
    <view class="drawer-content glass-panel">
      <view class="drawer-header">
        <text class="drawer-title font-mono">永久记忆碎片</text>
        <view class="close-btn" @click="$emit('close')">
          <text class="close-icon">×</text>
        </view>
      </view>

      <view class="drawer-body">
        <view class="memory-intro">
          <text class="intro-text">这些是守护兽为你保存的珍贵记忆碎片</text>
        </view>

        <view class="memory-list" v-if="memories.length > 0">
          <view 
            class="memory-card glass-card" 
            v-for="(memory, index) in memories" 
            :key="index"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <view class="memory-header">
              <view class="memory-score">
                <text class="score-value">{{ memory.importanceScore }}</text>
                <text class="score-label">重要度</text>
              </view>
              <view class="memory-date">
                <text class="date-text">{{ formatDate(memory.createdAt) }}</text>
              </view>
            </view>

            <view class="memory-content">
              <text class="memory-summary">{{ memory.summary }}</text>
            </view>

            <view class="memory-tags" v-if="memory.tags && memory.tags.length > 0">
              <view class="tag" v-for="(tag, tagIndex) in memory.tags" :key="tagIndex">
                <text class="tag-text">{{ tag }}</text>
              </view>
            </view>

            <view class="memory-glow"></view>
          </view>
        </view>

        <view class="empty-state" v-else>
          <view class="empty-icon">💭</view>
          <text class="empty-text">还没有永久记忆</text>
          <text class="empty-hint">与守护兽对话，它会帮你记住重要的事</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { UserMemory } from '@/api/types'

defineProps<{
  isOpen: boolean
  memories: UserMemory[]
}>()

defineEmits<{
  (e: 'close'): void
}>()

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}
</script>

<style scoped>
.memory-drawer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.memory-drawer.drawer-open {
  pointer-events: auto;
  opacity: 1;
}

.drawer-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
}

.drawer-content {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 80%;
  max-width: 600rpx;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%);
  border-left: 1px solid rgba(193, 255, 114, 0.2);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}

.memory-drawer.drawer-open .drawer-content {
  transform: translateX(0);
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 32rpx;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.drawer-title {
  font-size: 32rpx;
  color: #C1FF72;
  font-weight: 600;
  letter-spacing: 2rpx;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
}

.close-icon {
  font-size: 40rpx;
  color: rgba(255, 255, 255, 0.6);
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 24rpx;
}

.memory-intro {
  margin-bottom: 32rpx;
  padding: 24rpx;
  background: rgba(193, 255, 114, 0.05);
  border-radius: 16rpx;
  border: 1px solid rgba(193, 255, 114, 0.1);
}

.intro-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
}

.memory-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.memory-card {
  position: relative;
  padding: 24rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  animation: card-fade-in 0.5s ease forwards;
  opacity: 0;
  transform: translateY(20rpx);
}

@keyframes card-fade-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.memory-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2rpx;
  background: linear-gradient(90deg, transparent, #C1FF72, transparent);
  opacity: 0.5;
}

.memory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.memory-score {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.score-value {
  font-size: 32rpx;
  color: #C1FF72;
  font-weight: 600;
  font-family: monospace;
}

.score-label {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.4);
}

.memory-date {
  padding: 6rpx 16rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20rpx;
}

.date-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.5);
}

.memory-content {
  margin-bottom: 16rpx;
}

.memory-summary {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

.memory-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.tag {
  padding: 8rpx 16rpx;
  background: rgba(0, 242, 255, 0.1);
  border: 1px solid rgba(0, 242, 255, 0.2);
  border-radius: 20rpx;
}

.tag-text {
  font-size: 22rpx;
  color: #00F2FF;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 12rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.4);
}
</style>
