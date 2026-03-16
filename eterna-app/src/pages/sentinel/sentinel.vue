<template>
  <view class="sentinel-page">
    <view class="background-effects">
      <view class="star" v-for="i in 50" :key="i" :style="getStarStyle(i)"></view>
      <view class="glow-orb orb-1"></view>
      <view class="glow-orb orb-2"></view>
    </view>

    <view class="page-header">
      <view class="header-left">
        <view class="header-info">
          <text class="header-name font-mono">{{ sentinelStore.name }}</text>
          <text class="header-status" :class="statusClass">{{ statusText }}</text>
        </view>
      </view>
      <view class="energy-display">
        <view class="energy-bar">
          <view class="energy-fill" :style="{ width: sentinelStore.energy + '%' }" :class="energyBarClass"></view>
        </view>
        <text class="energy-text font-mono">{{ sentinelStore.energy }}%</text>
      </view>
    </view>

    <view class="pet-section">
      <SentinelPet 
        :state="petState"
        :message="sentinelStore.currentMessage"
        :energy="sentinelStore.energy"
        :isFeeding="sentinelStore.isFeeding"
        @animationEnd="onAnimationEnd"
      />
    </view>

    <scroll-view class="chat-area" scroll-y :scroll-top="scrollTop" scroll-with-animation>
      <view class="chat-messages">
        <view 
          v-for="(msg, index) in sentinelStore.chatHistory" 
          :key="index" 
          class="message-item" 
          :class="msg.role"
        >
          <view class="message-avatar" v-if="msg.role === 'assistant'">
            <text>◈</text>
          </view>
          <view class="message-content glass-panel">
            <text class="message-text font-serif">{{ msg.content }}</text>
            <text class="message-time">{{ formatTime(msg.createdAt) }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="input-area">
      <view class="quick-replies">
        <view 
          v-for="(reply, index) in quickReplies" 
          :key="index" 
          class="reply-btn glass-panel"
          @click="sendQuickReply(reply)"
        >
          <text class="reply-text">{{ reply }}</text>
        </view>
      </view>
      
      <view class="input-container glass-panel">
        <input 
          class="chat-input font-serif"
          v-model="inputText"
          placeholder="说点什么..."
          placeholder-class="placeholder-text"
          @confirm="sendMessage"
        />
        <view class="voice-btn" @click="startVoice">
          <view class="voice-wave" :class="{ active: isRecording }">
            <view class="wave-bar" v-for="i in 4" :key="i"></view>
          </view>
        </view>
        <view class="send-btn" @click="sendMessage" :class="{ disabled: !inputText.trim() || sentinelStore.isLoading }">
          <text class="send-icon">◈</text>
        </view>
      </view>
    </view>

    <view class="action-panel glass-panel">
      <view class="panel-action" @click="feedSentinel">
        <text class="panel-icon">🍎</text>
        <text class="panel-text">喂食</text>
      </view>
      <view class="panel-action" @click="openMemoryDrawer">
        <text class="panel-icon">📜</text>
        <text class="panel-text">记忆</text>
      </view>
      <view class="panel-action" @click="customizeSentinel">
        <text class="panel-icon">🎨</text>
        <text class="panel-text">装扮</text>
      </view>
      <view class="panel-action" @click="viewStats">
        <text class="panel-icon">📊</text>
        <text class="panel-text">状态</text>
      </view>
    </view>

    <MemoryDrawer 
      :isOpen="showMemoryDrawer"
      :memories="sentinelStore.memories"
      @close="showMemoryDrawer = false"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSentinelStore } from '@/stores/sentinel'
import { useUserStore } from '@/stores/user'
import SentinelPet from '@/components/SentinelPet.vue'
import MemoryDrawer from '@/components/MemoryDrawer.vue'

const sentinelStore = useSentinelStore()
const userStore = useUserStore()

const inputText = ref('')
const isRecording = ref(false)
const scrollTop = ref(0)
const showMemoryDrawer = ref(false)

const quickReplies = ref([
  '今天很开心',
  '有点累了',
  '想记录点什么',
  '只是来看看你'
])

const petState = computed(() => {
  if (sentinelStore.isFeeding) return 'HAPPY'
  if (sentinelStore.isLoading) return 'LISTENING'
  if (sentinelStore.energy < 30) return 'WEAK'
  return 'IDLE'
})

const statusClass = computed(() => {
  const energy = sentinelStore.energy
  if (energy > 70) return 'status-active'
  if (energy > 30) return 'status-normal'
  return 'status-warning'
})

const statusText = computed(() => {
  const energy = sentinelStore.energy
  if (energy > 70) return '活力充沛'
  if (energy > 30) return '能量平稳'
  return '需要关注'
})

const energyBarClass = computed(() => {
  const energy = sentinelStore.energy
  if (energy > 70) return 'high'
  if (energy > 30) return 'medium'
  return 'low'
})

function getStarStyle(index: number) {
  const size = Math.random() * 3 + 1
  const left = Math.random() * 100
  const top = Math.random() * 100
  const delay = Math.random() * 3
  return {
    width: `${size}rpx`,
    height: `${size}rpx`,
    left: `${left}%`,
    top: `${top}%`,
    animationDelay: `${delay}s`,
  }
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

async function sendMessage() {
  if (!inputText.value.trim() || sentinelStore.isLoading) return
  
  const message = inputText.value
  inputText.value = ''
  
  await sentinelStore.chat(message)
  scrollTop.value = 99999
}

function sendQuickReply(reply: string) {
  inputText.value = reply
  sendMessage()
}

function startVoice() {
  isRecording.value = !isRecording.value
  if (isRecording.value) {
    uni.showToast({
      title: '正在录音...',
      icon: 'none'
    })
    setTimeout(() => {
      isRecording.value = false
    }, 3000)
  }
}

async function feedSentinel() {
  const increase = await sentinelStore.feed()
  if (increase > 0) {
    uni.showToast({
      title: `能量 +${increase}`,
      icon: 'success'
    })
  }
}

function openMemoryDrawer() {
  showMemoryDrawer.value = true
  sentinelStore.fetchMemories()
}

function customizeSentinel() {
  uni.showToast({
    title: '装扮功能开发中',
    icon: 'none'
  })
}

function viewStats() {
  uni.showToast({
    title: `能量: ${sentinelStore.energy}%`,
    icon: 'none'
  })
}

function onAnimationEnd() {
  setTimeout(() => {
    sentinelStore.clearMessage()
  }, 3000)
}

onMounted(() => {
  userStore.init()
  if (userStore.isLoggedIn) {
    sentinelStore.fetchHistory()
  }
})
</script>

<style scoped>
.sentinel-page {
  min-height: 100vh;
  background: radial-gradient(ellipse at top, #1A1A1A 0%, #0A0A0A 100%);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.background-effects {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.star {
  position: absolute;
  background: #C1FF72;
  border-radius: 50%;
  animation: twinkle 3s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.8; }
}

.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80rpx);
  opacity: 0.2;
}

.orb-1 {
  width: 400rpx;
  height: 400rpx;
  background: #00F2FF;
  top: 5%;
  right: -10%;
  animation: float 10s ease-in-out infinite;
}

.orb-2 {
  width: 300rpx;
  height: 300rpx;
  background: #C1FF72;
  bottom: 20%;
  left: -5%;
  animation: float 12s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(40rpx, -40rpx); }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 80rpx 32rpx 24rpx;
  position: relative;
  z-index: 10;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.header-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #ffffff;
}

.header-status {
  font-size: 22rpx;
  margin-top: 4rpx;
}

.status-active { color: #C1FF72; }
.status-normal { color: #00F2FF; }
.status-warning { color: #FF5C00; }

.energy-display {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
}

.energy-bar {
  width: 120rpx;
  height: 8rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4rpx;
  overflow: hidden;
}

.energy-fill {
  height: 100%;
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

.energy-fill.high { background: linear-gradient(90deg, #C1FF72, #8BC34A); }
.energy-fill.medium { background: linear-gradient(90deg, #00F2FF, #00B8CC); }
.energy-fill.low { background: linear-gradient(90deg, #FF5C00, #FF8A33); }

.energy-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.5);
}

.pet-section {
  display: flex;
  justify-content: center;
  padding: 40rpx 0;
  position: relative;
  z-index: 10;
}

.chat-area {
  flex: 1;
  padding: 0 24rpx;
  max-height: 400rpx;
  position: relative;
  z-index: 10;
}

.chat-messages {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding-bottom: 20rpx;
}

.message-item {
  display: flex;
  gap: 12rpx;
  max-width: 85%;
}

.message-item.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-item.assistant {
  align-self: flex-start;
}

.message-avatar {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(193, 255, 114, 0.2) 0%, rgba(0, 242, 255, 0.2) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-avatar text {
  font-size: 20rpx;
  color: #C1FF72;
}

.message-content {
  border-radius: 16rpx;
  padding: 16rpx 20rpx;
}

.message-item.user .message-content {
  background: linear-gradient(135deg, rgba(193, 255, 114, 0.15) 0%, rgba(0, 242, 255, 0.15) 100%);
}

.message-item.assistant .message-content {
  background: rgba(255, 255, 255, 0.05);
}

.message-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

.message-time {
  font-size: 18rpx;
  color: rgba(255, 255, 255, 0.3);
  margin-top: 6rpx;
  display: block;
}

.input-area {
  padding: 16rpx 24rpx;
  background: rgba(10, 10, 10, 0.9);
  position: relative;
  z-index: 10;
}

.quick-replies {
  display: flex;
  gap: 12rpx;
  margin-bottom: 12rpx;
  overflow-x: auto;
  white-space: nowrap;
}

.reply-btn {
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
}

.reply-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.7);
}

.input-container {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 16rpx;
  border-radius: 28rpx;
}

.chat-input {
  flex: 1;
  font-size: 26rpx;
  color: #ffffff;
  background: transparent;
}

.placeholder-text {
  color: rgba(255, 255, 255, 0.3);
}

.voice-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.voice-wave {
  display: flex;
  align-items: center;
  gap: 3rpx;
  height: 28rpx;
}

.wave-bar {
  width: 3rpx;
  height: 14rpx;
  background: rgba(0, 242, 255, 0.5);
  border-radius: 2rpx;
}

.voice-wave.active .wave-bar {
  background: #00F2FF;
  animation: wave 0.5s ease-in-out infinite;
}

.voice-wave.active .wave-bar:nth-child(1) { animation-delay: 0s; }
.voice-wave.active .wave-bar:nth-child(2) { animation-delay: 0.1s; }
.voice-wave.active .wave-bar:nth-child(3) { animation-delay: 0.2s; }
.voice-wave.active .wave-bar:nth-child(4) { animation-delay: 0.3s; }

@keyframes wave {
  0%, 100% { height: 14rpx; }
  50% { height: 28rpx; }
}

.send-btn {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #C1FF72 0%, #00F2FF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s;
}

.send-btn.disabled {
  opacity: 0.5;
}

.send-icon {
  font-size: 20rpx;
  color: #0A0A0A;
}

.action-panel {
  display: flex;
  justify-content: space-around;
  padding: 16rpx;
  margin: 12rpx 24rpx 24rpx;
  border-radius: 20rpx;
  position: relative;
  z-index: 10;
}

.panel-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}

.panel-icon {
  font-size: 32rpx;
}

.panel-text {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.6);
}
</style>
