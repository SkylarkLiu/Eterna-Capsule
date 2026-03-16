<template>
  <view class="sentinel-page">
    <view class="background-effects">
      <view class="star" v-for="i in 50" :key="i" :style="getStarStyle(i)"></view>
      <view class="glow-orb orb-1"></view>
      <view class="glow-orb orb-2"></view>
    </view>

    <view class="page-header">
      <view class="header-left" @click="openMetaEditor">
        <view class="header-info">
          <view class="name-row">
            <text class="header-name font-mono">{{ sentinelStore.name }}</text>
            <text class="edit-icon">✎</text>
          </view>
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
        :isSpeaking="sentinelStore.isSpeaking"
        @animationEnd="onAnimationEnd"
      />
    </view>

    <view class="bottom-container">
      <view class="chat-preview" @click="openChatDetail">
        <view class="preview-header">
          <text class="preview-title">对话预览</text>
          <text class="preview-more">查看全部 →</text>
        </view>
        <view class="preview-messages" v-if="previewMessages.length > 0 || sentinelStore.isLoading">
          <view 
            v-for="(msg, index) in previewMessages" 
            :key="index" 
            class="preview-item"
            :class="msg.role"
          >
            <view class="preview-avatar" v-if="msg.role === 'assistant'">
              <text>{{ sentinelStore.symbol }}</text>
            </view>
            <view class="preview-bubble">
              <text class="preview-text">{{ msg.displayContent || msg.content }}</text>
            </view>
          </view>
          <view class="preview-item assistant thinking" v-if="sentinelStore.isLoading && !hasAssistantResponse">
            <view class="preview-avatar">
              <text>{{ sentinelStore.symbol }}</text>
            </view>
            <view class="preview-bubble thinking-bubble">
              <text class="thinking-text">{{ sentinelStore.name }}正在沉思...</text>
            </view>
          </view>
        </view>
        <view class="preview-empty" v-else>
          <text class="empty-text">点击开始与守护兽对话</text>
        </view>
      </view>

      <view class="input-section">
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
        <view class="panel-action" @click="openMetaEditor">
          <text class="panel-icon">🎨</text>
          <text class="panel-text">人格</text>
        </view>
        <view class="panel-action" @click="viewStats">
          <text class="panel-icon">📊</text>
          <text class="panel-text">状态</text>
        </view>
      </view>
    </view>

    <MemoryDrawer 
      :isOpen="showMemoryDrawer"
      :memories="sentinelStore.memories"
      @close="showMemoryDrawer = false"
    />

    <SentinelMetaEditor 
      :visible="showMetaEditor"
      @close="showMetaEditor = false"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useSentinelStore } from '@/stores/sentinel'
import { useUserStore } from '@/stores/user'
import SentinelPet from '@/components/SentinelPet.vue'
import MemoryDrawer from '@/components/MemoryDrawer.vue'
import SentinelMetaEditor from '@/components/SentinelMetaEditor.vue'

const sentinelStore = useSentinelStore()
const userStore = useUserStore()

const inputText = ref('')
const isRecording = ref(false)
const showMemoryDrawer = ref(false)
const showMetaEditor = ref(false)
const previewMessages = ref<Array<{ role: string; content: string; displayContent: string }>>([])
const isTyping = ref(false)

const quickReplies = ref([
  '今天很开心',
  '有点累了',
  '想记录点什么',
  '只是来看看你'
])

const petState = computed(() => {
  if (sentinelStore.isFeeding) return 'HAPPY'
  if (sentinelStore.isLoading) return 'LISTENING'
  if (sentinelStore.isSpeaking) return 'LISTENING'
  if (sentinelStore.energy < 30) return 'WEAK'
  return 'IDLE'
})

const hasAssistantResponse = computed(() => {
  return previewMessages.value.some(m => m.role === 'assistant' && m.displayContent)
})

const statusClass = computed(() => {
  const energy = sentinelStore.energy
  if (energy > 70) return 'status-active'
  if (energy > 30) return 'status-normal'
  return 'status-warning'
})

const statusText = computed(() => {
  if (sentinelStore.isLoading) return '正在思考...'
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

async function sendMessage() {
  if (!inputText.value.trim() || sentinelStore.isLoading) return
  
  const message = inputText.value
  inputText.value = ''
  
  previewMessages.value = [{
    role: 'user',
    content: message,
    displayContent: message
  }]
  
  const response = await sentinelStore.chat(message)
  
  if (response) {
    previewMessages.value.push({
      role: 'assistant',
      content: response,
      displayContent: ''
    })
    
    await typewriterEffect(response)
  }
}

async function typewriterEffect(text: string) {
  isTyping.value = true
  const lastIndex = previewMessages.value.length - 1
  let displayText = ''
  
  for (let i = 0; i < text.length; i++) {
    const delay = 30 + Math.random() * 50
    await new Promise(resolve => setTimeout(resolve, delay))
    displayText += text[i]
    if (previewMessages.value[lastIndex]) {
      previewMessages.value[lastIndex].displayContent = displayText
    }
  }
  
  isTyping.value = false
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

function openMetaEditor() {
  showMetaEditor.value = true
}

function openChatDetail() {
  uni.navigateTo({
    url: '/pages/chat-detail/chat-detail'
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

onMounted(async () => {
  userStore.init()
  if (userStore.isLoggedIn) {
    await sentinelStore.fetchConfig()
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
  top: 30%;
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

.header-left {
  cursor: pointer;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.header-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #ffffff;
}

.edit-icon {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.4);
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
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 10;
  min-height: 300rpx;
}

.bottom-container {
  position: relative;
  z-index: 10;
  background: linear-gradient(180deg, transparent 0%, rgba(10, 10, 10, 0.95) 20%);
  padding-top: 20rpx;
}

.chat-preview {
  margin: 0 24rpx 12rpx;
  padding: 16rpx 20rpx;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.preview-title {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.5);
}

.preview-more {
  font-size: 20rpx;
  color: #C1FF72;
}

.preview-messages {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  max-height: 200rpx;
  overflow: hidden;
}

.preview-item {
  display: flex;
  gap: 8rpx;
  max-width: 90%;
}

.preview-item.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.preview-item.assistant {
  align-self: flex-start;
}

.preview-avatar {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(193, 255, 114, 0.2) 0%, rgba(0, 242, 255, 0.2) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.preview-avatar text {
  font-size: 14rpx;
  color: #C1FF72;
}

.preview-bubble {
  padding: 10rpx 14rpx;
  border-radius: 10rpx;
  max-width: 100%;
}

.preview-item.assistant .preview-bubble {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.preview-item.user .preview-bubble {
  background: linear-gradient(135deg, rgba(193, 255, 114, 0.1) 0%, rgba(0, 242, 255, 0.1) 100%);
  border: 1px solid rgba(193, 255, 114, 0.15);
}

.preview-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
}

.preview-empty {
  padding: 16rpx;
  text-align: center;
}

.preview-empty .empty-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.4);
}

.preview-item.thinking .thinking-bubble {
  background: rgba(193, 255, 114, 0.05);
  border: 1px solid rgba(193, 255, 114, 0.2);
  animation: thinking-pulse 1.5s ease-in-out infinite;
}

.thinking-text {
  font-size: 22rpx;
  color: rgba(193, 255, 114, 0.7);
  font-style: italic;
}

@keyframes thinking-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.input-section {
  padding: 12rpx 24rpx;
}

.quick-replies {
  display: flex;
  gap: 10rpx;
  margin-bottom: 10rpx;
  overflow-x: auto;
  white-space: nowrap;
}

.reply-btn {
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  flex-shrink: 0;
}

.reply-text {
  font-size: 20rpx;
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
  padding: 14rpx 16rpx;
  margin: 8rpx 24rpx;
  margin-bottom: calc(8rpx + env(safe-area-inset-bottom));
  border-radius: 16rpx;
}

.panel-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.panel-icon {
  font-size: 28rpx;
}

.panel-text {
  font-size: 18rpx;
  color: rgba(255, 255, 255, 0.6);
}
</style>
