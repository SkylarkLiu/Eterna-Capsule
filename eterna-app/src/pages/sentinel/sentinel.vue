<template>
  <view class="sentinel-page">
    <view class="page-header">
      <view class="header-left">
        <view class="mini-sentinel">
          <text class="mini-symbol">{{ sentinelStore.symbol }}</text>
        </view>
        <view class="header-info">
          <text class="header-name font-mono">{{ sentinelStore.name }}</text>
          <text class="header-status" :class="statusClass">{{ statusText }}</text>
        </view>
      </view>
      <view class="energy-mini">
        <view class="energy-bar-mini">
          <view class="energy-fill-mini" :style="{ width: sentinelStore.energy + '%' }" :class="energyBarClass"></view>
        </view>
        <text class="energy-text-mini font-mono">{{ sentinelStore.energy }}%</text>
      </view>
    </view>

    <scroll-view class="chat-area" scroll-y :scroll-top="scrollTop">
      <view class="chat-messages">
        <view v-for="(msg, index) in messages" :key="index" class="message-item" :class="msg.type">
          <view class="message-avatar" v-if="msg.type === 'sentinel'">
            <text>{{ sentinelStore.symbol }}</text>
          </view>
          <view class="message-content glass-panel">
            <text class="message-text font-serif">{{ msg.content }}</text>
            <text class="message-time">{{ msg.time }}</text>
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
        <view class="send-btn" @click="sendMessage">
          <text class="send-icon">◈</text>
        </view>
      </view>
    </view>

    <view class="action-panel glass-panel">
      <view class="panel-action" @click="feedSentinel">
        <text class="panel-icon">🍎</text>
        <text class="panel-text">喂食</text>
      </view>
      <view class="panel-action" @click="playWithSentinel">
        <text class="panel-icon">🎮</text>
        <text class="panel-text">互动</text>
      </view>
      <view class="panel-action" @click="customizeSentinel">
        <text class="panel-icon">🎨</text>
        <text class="panel-text">装扮</text>
      </view>
      <view class="panel-action" @click="viewMemories">
        <text class="panel-icon">📜</text>
        <text class="panel-text">回忆</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSentinelStore } from '@/stores/sentinel'

const sentinelStore = useSentinelStore()

const inputText = ref('')
const isRecording = ref(false)
const scrollTop = ref(0)

interface Message {
  type: 'user' | 'sentinel'
  content: string
  time: string
}

const messages = ref<Message[]>([
  {
    type: 'sentinel',
    content: '主人，欢迎回来！今天有什么想和我分享的吗？',
    time: '10:30'
  },
  {
    type: 'user',
    content: '今天工作很顺利，想和你聊聊',
    time: '10:32'
  },
  {
    type: 'sentinel',
    content: '太好了！主人辛苦了~ 我一直在等你呢。有什么开心的事情想记录下来吗？',
    time: '10:32'
  }
])

const quickReplies = ref([
  '今天很开心',
  '有点累了',
  '想记录点什么',
  '只是来看看你'
])

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

const getCurrentTime = () => {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

const sendMessage = () => {
  if (!inputText.value.trim()) return
  
  messages.value.push({
    type: 'user',
    content: inputText.value,
    time: getCurrentTime()
  })
  
  const userMessage = inputText.value
  inputText.value = ''
  
  setTimeout(() => {
    const responses = [
      '主人说的我都记下了~',
      '我明白主人的心意，会一直守护着你的。',
      '谢谢你愿意和我分享这些，我会好好保存的。',
      '主人，你的每一句话我都会珍藏在心里。'
    ]
    messages.value.push({
      type: 'sentinel',
      content: responses[Math.floor(Math.random() * responses.length)],
      time: getCurrentTime()
    })
    sentinelStore.addConversation()
  }, 1000)
  
  scrollTop.value = 99999
}

const sendQuickReply = (reply: string) => {
  inputText.value = reply
  sendMessage()
}

const startVoice = () => {
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

const feedSentinel = () => {
  sentinelStore.feed()
  messages.value.push({
    type: 'sentinel',
    content: '谢谢主人的投喂！感觉能量满满~',
    time: getCurrentTime()
  })
}

const playWithSentinel = () => {
  uni.showToast({
    title: '互动功能开发中',
    icon: 'none'
  })
}

const customizeSentinel = () => {
  uni.showToast({
    title: '装扮功能开发中',
    icon: 'none'
  })
}

const viewMemories = () => {
  uni.showToast({
    title: '回忆功能开发中',
    icon: 'none'
  })
}
</script>

<style scoped>
.sentinel-page {
  min-height: 100vh;
  background: radial-gradient(ellipse at top, #1A1A1A 0%, #0A0A0A 100%);
  display: flex;
  flex-direction: column;
  padding-top: 80rpx;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  background: rgba(10, 10, 10, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.mini-sentinel {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(193, 255, 114, 0.2) 0%, rgba(0, 242, 255, 0.2) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mini-symbol {
  font-size: 32rpx;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.header-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #ffffff;
}

.header-status {
  font-size: 20rpx;
  margin-top: 4rpx;
}

.status-active {
  color: #C1FF72;
}

.status-normal {
  color: #00F2FF;
}

.status-warning {
  color: #FF5C00;
}

.energy-mini {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.energy-bar-mini {
  width: 100rpx;
  height: 6rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3rpx;
  overflow: hidden;
}

.energy-fill-mini {
  height: 100%;
  border-radius: 3rpx;
  transition: width 0.3s ease;
}

.energy-fill-mini.high {
  background: linear-gradient(90deg, #C1FF72, #8BC34A);
}

.energy-fill-mini.medium {
  background: linear-gradient(90deg, #00F2FF, #00B8CC);
}

.energy-fill-mini.low {
  background: linear-gradient(90deg, #FF5C00, #FF8A33);
}

.energy-text-mini {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 8rpx;
}

.chat-area {
  flex: 1;
  padding: 24rpx;
}

.chat-messages {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.message-item {
  display: flex;
  gap: 16rpx;
  max-width: 80%;
}

.message-item.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-item.sentinel {
  align-self: flex-start;
}

.message-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(193, 255, 114, 0.2) 0%, rgba(0, 242, 255, 0.2) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-avatar text {
  font-size: 24rpx;
}

.message-content {
  border-radius: 20rpx;
  padding: 20rpx 24rpx;
}

.message-item.user .message-content {
  background: linear-gradient(135deg, rgba(193, 255, 114, 0.15) 0%, rgba(0, 242, 255, 0.15) 100%);
}

.message-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

.message-time {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.3);
  margin-top: 8rpx;
  display: block;
}

.input-area {
  padding: 16rpx 24rpx;
  background: rgba(10, 10, 10, 0.9);
}

.quick-replies {
  display: flex;
  gap: 12rpx;
  margin-bottom: 16rpx;
  overflow-x: auto;
  white-space: nowrap;
}

.reply-btn {
  padding: 12rpx 24rpx;
  border-radius: 24rpx;
  flex-shrink: 0;
}

.reply-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.input-container {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 20rpx;
  border-radius: 32rpx;
}

.chat-input {
  flex: 1;
  font-size: 28rpx;
  color: #ffffff;
  background: transparent;
}

.placeholder-text {
  color: rgba(255, 255, 255, 0.3);
}

.voice-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.voice-wave {
  display: flex;
  align-items: center;
  gap: 4rpx;
  height: 32rpx;
}

.wave-bar {
  width: 4rpx;
  height: 16rpx;
  background: rgba(0, 242, 255, 0.5);
  border-radius: 2rpx;
  transition: height 0.2s ease;
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
  0%, 100% { height: 16rpx; }
  50% { height: 32rpx; }
}

.send-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #C1FF72 0%, #00F2FF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-icon {
  font-size: 24rpx;
  color: #0A0A0A;
}

.action-panel {
  display: flex;
  justify-content: space-around;
  padding: 20rpx 16rpx;
  margin: 16rpx 24rpx 24rpx;
  border-radius: 24rpx;
}

.panel-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.panel-icon {
  font-size: 36rpx;
}

.panel-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.6);
}
</style>
