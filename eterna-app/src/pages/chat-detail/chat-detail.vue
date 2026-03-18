<template>
  <view class="chat-detail-page">
    <view class="background-effects">
      <view class="star" v-for="i in 50" :key="i" :style="getStarStyle(i)"></view>
      <view class="particle-flow">
        <view class="particle" v-for="i in 20" :key="`p-${i}`" :style="getParticleStyle(i)"></view>
      </view>
    </view>

    <view class="chat-header glass-panel">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="header-info">
        <view class="sentinel-avatar">
          <view class="avatar-glow"></view>
          <text class="avatar-symbol">{{ sentinelStore.symbol }}</text>
        </view>
        <view class="header-text">
          <text class="header-name">{{ sentinelStore.name }}</text>
          <text class="header-status" :class="statusClass">{{ statusText }}</text>
        </view>
      </view>
      <view class="header-actions">
        <view class="action-btn" @click="toggleSearch">
          <text class="action-icon">🔍</text>
        </view>
        <view class="action-btn" @click="showDatePicker = true">
          <text class="action-icon">📅</text>
        </view>
        <view class="action-btn" @click="clearChat">
          <text class="action-icon">🗑️</text>
        </view>
      </view>
    </view>

    <view class="search-bar glass-panel" v-if="showSearchBar">
      <input 
        class="search-input"
        v-model="searchQuery"
        placeholder="搜索记忆碎片..."
        placeholder-class="placeholder-text"
      />
      <view class="search-close" @click="toggleSearch">
        <text>×</text>
      </view>
    </view>

    <scroll-view 
      class="chat-messages" 
      scroll-y 
      :scroll-top="scrollTop" 
      scroll-with-animation
    >
      <view class="messages-container">
        <view 
          v-for="(msg, index) in displayMessages" 
          :key="msg.id" 
          :id="`msg-${msg.id}`"
          class="message-item" 
          :class="[msg.role, { 'highlighted': isHighlighted(msg.content), 'thinking': msg.isThinking, 'typing': msg.isTyping }]"
        >
          <view class="message-date" v-if="shouldShowDate(index)">
            <text class="date-text">{{ formatDate(msg.createdAt) }}</text>
          </view>
          
          <view class="message-content-wrapper">
            <view class="message-avatar sentinel-avatar" v-if="msg.role === 'assistant'">
              <view class="avatar-core">
                <text>{{ sentinelStore.symbol }}</text>
              </view>
            </view>
            <view class="message-bubble" :class="msg.role">
              <!-- 思考中状态：显示加载动画 -->
              <view class="thinking-dots" v-if="msg.isThinking && !msg.isTyping">
                <view class="dot"></view>
                <view class="dot"></view>
                <view class="dot"></view>
              </view>
              <!-- 打字机状态：显示正在输入的内容 -->
              <text class="message-text font-serif" v-else>{{ msg.displayContent || msg.content }}</text>
              <text class="message-time" v-if="!msg.isThinking">{{ formatTime(msg.createdAt) }}</text>
            </view>
            <view class="message-avatar user-avatar" v-if="msg.role === 'user'">
              <image 
                v-if="userStore.user?.avatarUrl" 
                :src="userStore.user.avatarUrl" 
                class="avatar-image"
                mode="aspectFill"
              />
              <view v-else class="avatar-placeholder">
                <text>{{ userStore.user?.username?.charAt(0)?.toUpperCase() || 'U' }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="chat-input-area glass-panel">
      <view class="quick-replies">
        <view 
          v-for="(reply, index) in quickReplies" 
          :key="index" 
          class="reply-chip"
          @click="sendQuickReply(reply)"
        >
          <text class="reply-text">{{ reply }}</text>
        </view>
      </view>
      
      <view class="input-row" :class="{ 'sending': isSending }">
        <input 
          class="chat-input font-serif"
          v-model="inputText"
          placeholder="说点什么..."
          placeholder-class="placeholder-text"
          @confirm="sendMessage"
          :adjust-position="true"
        />
        <view class="send-btn" @click="sendMessage" :class="{ disabled: !inputText.trim() || isWaitingResponse }">
          <text class="send-icon">◈</text>
        </view>
      </view>
    </view>

    <view class="date-picker-overlay" v-if="showDatePicker" @click="showDatePicker = false">
      <view class="date-picker glass-panel" @click.stop>
        <view class="picker-header">
          <text class="picker-title">选择日期</text>
          <view class="picker-close" @click="showDatePicker = false">×</view>
        </view>
        <view class="picker-dates">
          <view 
            v-for="date in availableDates" 
            :key="date" 
            class="date-item"
            @click="jumpToDate(date)"
          >
            <text class="date-label">{{ formatDateLabel(date) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useSentinelStore } from '@/stores/sentinel'
import { useUserStore } from '@/stores/user'
import { sentinelApi } from '@/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  displayContent: string
  createdAt: string
  isThinking?: boolean
  isTyping?: boolean
}

const sentinelStore = useSentinelStore()
const userStore = useUserStore()

const inputText = ref('')
const scrollTop = ref(0)
const showSearchBar = ref(false)
const searchQuery = ref('')
const showDatePicker = ref(false)
const isSending = ref(false)
const isWaitingResponse = ref(false)
const messages = ref<Message[]>([])
const currentTypingId = ref<string | null>(null)

const quickReplies = [
  '你好',
  '今天心情不错',
  '有点累了',
  '想记录点什么',
]

const statusClass = computed(() => {
  const energy = sentinelStore.energy
  if (energy > 70) return 'status-active'
  if (energy > 30) return 'status-normal'
  return 'status-warning'
})

const statusText = computed(() => {
  if (isWaitingResponse.value) return '正在思考...'
  const energy = sentinelStore.energy
  if (energy > 70) return '活力充沛'
  if (energy > 30) return '能量平稳'
  return '需要关注'
})

const displayMessages = computed(() => {
  let filtered = messages.value
  
  if (searchQuery.value.trim()) {
    filtered = filtered.filter(m => 
      m.content.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  return filtered
})

const availableDates = computed(() => {
  const dates = new Set<string>()
  messages.value.forEach(msg => {
    const date = new Date(msg.createdAt).toDateString()
    dates.add(date)
  })
  return Array.from(dates).reverse()
})

function getStarStyle(index: number) {
  const size = Math.random() * 2 + 1
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

function getParticleStyle(index: number) {
  const left = Math.random() * 100
  const delay = Math.random() * 10
  const duration = 10 + Math.random() * 10
  return {
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  }
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) return '今天'
  if (date.toDateString() === yesterday.toDateString()) return '昨天'
  
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}

function shouldShowDate(index: number): boolean {
  if (index === 0) return true
  const currentMsg = displayMessages.value[index]
  const prevMsg = displayMessages.value[index - 1]
  return new Date(currentMsg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString()
}

function isHighlighted(content: string): boolean {
  if (!searchQuery.value.trim()) return false
  return content.toLowerCase().includes(searchQuery.value.toLowerCase())
}

function goBack() {
  uni.navigateBack()
}

function toggleSearch() {
  showSearchBar.value = !showSearchBar.value
  if (!showSearchBar.value) {
    searchQuery.value = ''
  }
}

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

async function sendMessage() {
  if (!inputText.value.trim() || isWaitingResponse.value) return
  
  const messageContent = inputText.value.trim()
  inputText.value = ''
  
  isSending.value = true
  setTimeout(() => {
    isSending.value = false
  }, 300)
  
  const now = new Date()
  
  // 1. 添加用户消息（单一消息对象）
  const userMsgId = generateId()
  messages.value.push({
    id: userMsgId,
    role: 'user',
    content: messageContent,
    displayContent: messageContent,
    createdAt: now.toISOString(),
  })
  
  await nextTick()
  scrollToBottom()
  
  // 2. 添加"思考中"的助手消息（单一消息对象，不重复）
  const assistantMsgId = generateId()
  messages.value.push({
    id: assistantMsgId,
    role: 'assistant',
    content: '',
    displayContent: '',
    createdAt: new Date(now.getTime() + 100).toISOString(),
    isThinking: true,  // 思考中状态
    isTyping: false,   // 打字机状态（初始为 false）
  })
  
  currentTypingId.value = assistantMsgId
  
  await nextTick()
  scrollToBottom()
  
  isWaitingResponse.value = true
  
  try {
    // 3. 调用 API（直接调用 API，不使用 store.chat，避免重复添加消息）
    const response = await sentinelApi.chat(messageContent)
    const fullResponse = response.sentinelResponse
    
    // 4. 找到"思考中"的消息，更新其状态（不新建消息对象）
    const msgIndex = messages.value.findIndex(m => m.id === assistantMsgId)
    if (msgIndex !== -1) {
      // 关闭思考状态，开启打字机状态
      messages.value[msgIndex].isThinking = false
      messages.value[msgIndex].isTyping = true
      messages.value[msgIndex].content = fullResponse
      
      // 5. 打字机效果：逐字更新 displayContent（只更新当前气泡）
      await typewriterEffect(msgIndex, fullResponse)
    }
    
    // 同步更新 store 的对话历史（用于其他页面展示）
    sentinelStore.chatHistory.push({
      id: userMsgId,
      role: 'user',
      content: messageContent,
      createdAt: now.toISOString(),
    })
    sentinelStore.chatHistory.push({
      id: assistantMsgId,
      role: 'assistant',
      content: fullResponse,
      createdAt: new Date(now.getTime() + 100).toISOString(),
    })
    
  } catch (error: any) {
    console.error('Chat error:', error)
    
    // 检查是否是超时错误
    const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout')
    
    // 超时时，尝试从服务器获取最新消息
    if (isTimeout) {
      // 更新"思考中"消息为超时提示
      const msgIndex = messages.value.findIndex(m => m.id === assistantMsgId)
      if (msgIndex !== -1) {
        messages.value[msgIndex].isThinking = false
        messages.value[msgIndex].isTyping = false
        messages.value[msgIndex].content = '守护兽思考时间较长，正在获取回复...'
        messages.value[msgIndex].displayContent = '守护兽思考时间较长，正在获取回复...'
      }
      
      // 尝试重新加载历史消息
      try {
        const historyResponse = await sentinelApi.getMessages(1, 3)
        const latestAssistant = historyResponse.messages.find((m: any) => m.role === 'assistant')
        
        if (latestAssistant && latestAssistant.content) {
          // 找到了回复，更新消息
          if (msgIndex !== -1) {
            messages.value[msgIndex].content = latestAssistant.content
            messages.value[msgIndex].displayContent = ''
            messages.value[msgIndex].isTyping = true
            await typewriterEffect(msgIndex, latestAssistant.content)
          }
        } else {
          // 没有找到回复，移除"思考中"消息
          if (msgIndex !== -1) {
            messages.value.splice(msgIndex, 1)
          }
          uni.showToast({
            title: '请求超时，请稍后重试',
            icon: 'none',
          })
        }
      } catch (reloadError) {
        // 重新加载失败，移除"思考中"消息
        const msgIndex = messages.value.findIndex(m => m.id === assistantMsgId)
        if (msgIndex !== -1) {
          messages.value.splice(msgIndex, 1)
        }
        uni.showToast({
          title: '请求超时，请稍后重试',
          icon: 'none',
        })
      }
    } else {
      // 非超时错误，直接移除"思考中"消息
      const msgIndex = messages.value.findIndex(m => m.id === assistantMsgId)
      if (msgIndex !== -1) {
        messages.value.splice(msgIndex, 1)
      }
      uni.showToast({
        title: '消息发送失败',
        icon: 'none',
      })
    }
  } finally {
    isWaitingResponse.value = false
    currentTypingId.value = null
  }
}

async function typewriterEffect(messageIndex: number, text: string) {
  let displayText = ''
  const msg = messages.value[messageIndex]
  
  if (!msg) return
  
  for (let i = 0; i < text.length; i++) {
    // 检查消息是否还存在
    if (!messages.value[messageIndex]) break
    
    const delay = 25 + Math.random() * 35
    await new Promise(resolve => setTimeout(resolve, delay))
    
    displayText += text[i]
    
    // 直接更新 displayContent，不触发整个列表重渲染
    if (messages.value[messageIndex]) {
      messages.value[messageIndex].displayContent = displayText
    }
    
    // 每 8 个字符滚动一次，减少滚动频率，避免闪烁
    if (i % 8 === 0) {
      scrollToBottomSmooth()
    }
  }
  
  // 打字机结束，设置最终状态
  if (messages.value[messageIndex]) {
    messages.value[messageIndex].isTyping = false
    messages.value[messageIndex].displayContent = text
  }
  
  await nextTick()
  scrollToBottom()
}

function scrollToBottomSmooth() {
  // 使用 requestAnimationFrame 减少闪烁
  requestAnimationFrame(() => {
    scrollTop.value = scrollTop.value === 99999 ? 99998 : 99999
  })
}

function scrollToBottom() {
  nextTick(() => {
    scrollTop.value = scrollTop.value === 99999 ? 99998 : 99999
  })
}

function sendQuickReply(reply: string) {
  inputText.value = reply
  sendMessage()
}

function clearChat() {
  uni.showModal({
    title: '清空对话',
    content: '确定要清空所有对话记录吗？',
    success: (res) => {
      if (res.confirm) {
        messages.value = []
        sentinelStore.chatHistory = []
      }
    }
  })
}

function jumpToDate(dateStr: string) {
  const index = displayMessages.value.findIndex(m => 
    new Date(m.createdAt).toDateString() === dateStr
  )
  if (index !== -1) {
    scrollToBottom()
  }
  showDatePicker.value = false
}

async function loadHistory() {
  try {
    const response = await sentinelApi.getMessages(1, 50)
    messages.value = response.messages.map(m => ({
      id: m.id || generateId(),
      role: m.role as 'user' | 'assistant',
      content: m.content,
      displayContent: m.content,
      createdAt: m.createdAt,
      isThinking: false,
      isTyping: false,
    }))
  } catch (error) {
    console.error('Failed to load history:', error)
  }
}

onMounted(async () => {
  userStore.init()
  await loadHistory()
  await nextTick()
  setTimeout(() => {
    scrollToBottom()
  }, 300)
})
</script>

<style scoped>
.chat-detail-page {
  min-height: 100vh;
  background: radial-gradient(ellipse at top, #1A1A1A 0%, #0A0A0A 100%);
  display: flex;
  flex-direction: column;
  position: relative;
}

.background-effects {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.star {
  position: absolute;
  background: #C1FF72;
  border-radius: 50%;
  opacity: 0.3;
  animation: twinkle 3s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.6; }
}

.particle-flow {
  position: absolute;
  inset: 0;
}

.particle {
  position: absolute;
  width: 2rpx;
  height: 20rpx;
  background: linear-gradient(180deg, transparent, rgba(193, 255, 114, 0.5), transparent);
  top: -20rpx;
  animation: particle-fall linear infinite;
}

@keyframes particle-fall {
  0% { transform: translateY(-20rpx); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(100vh); opacity: 0; }
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 24rpx 24rpx 24rpx 16rpx;
  gap: 16rpx;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
  z-index: 10;
}

.back-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
}

.back-icon {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.8);
}

.header-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.sentinel-avatar {
  position: relative;
  width: 64rpx;
  height: 64rpx;
}

.avatar-glow {
  position: absolute;
  inset: -8rpx;
  background: radial-gradient(circle, rgba(193, 255, 114, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: avatar-pulse 2s ease-in-out infinite;
}

@keyframes avatar-pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

.sentinel-avatar .avatar-core,
.sentinel-avatar .avatar-symbol {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(193, 255, 114, 0.2) 0%, rgba(0, 242, 255, 0.2) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sentinel-avatar .avatar-symbol {
  position: absolute;
  top: 0;
  left: 0;
}

.sentinel-avatar text {
  font-size: 28rpx;
  color: #C1FF72;
}

.header-text {
  display: flex;
  flex-direction: column;
}

.header-name {
  font-size: 30rpx;
  color: #ffffff;
  font-weight: 600;
}

.header-status {
  font-size: 22rpx;
}

.status-active { color: #C1FF72; }
.status-normal { color: #00F2FF; }
.status-warning { color: #FF5C00; }

.header-actions {
  display: flex;
  gap: 12rpx;
}

.action-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
}

.action-icon {
  font-size: 24rpx;
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  gap: 16rpx;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
  z-index: 10;
}

.search-input {
  flex: 1;
  height: 56rpx;
  padding: 0 20rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 28rpx;
  font-size: 26rpx;
  color: #ffffff;
}

.search-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
}

.search-close text {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.6);
}

.chat-messages {
  flex: 1;
  padding: 24rpx;
  position: relative;
  z-index: 1;
}

.messages-container {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding-bottom: 24rpx;
}

.message-date {
  text-align: center;
  padding: 16rpx 0;
}

.date-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.05);
  padding: 8rpx 24rpx;
  border-radius: 20rpx;
}

.message-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.message-content-wrapper {
  display: flex;
  gap: 12rpx;
  align-items: flex-start;
}

.message-item.user .message-content-wrapper {
  flex-direction: row;
  justify-content: flex-end;
}

.message-item.assistant .message-content-wrapper {
  flex-direction: row;
}

.message-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  flex-shrink: 0;
  overflow: hidden;
}

.message-avatar.sentinel-avatar {
  background: linear-gradient(135deg, rgba(193, 255, 114, 0.2) 0%, rgba(0, 242, 255, 0.2) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(193, 255, 114, 0.3);
}

.message-avatar.sentinel-avatar .avatar-core {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-avatar.sentinel-avatar text {
  font-size: 22rpx;
  color: #C1FF72;
}

.message-avatar.user-avatar {
  background: linear-gradient(135deg, rgba(0, 242, 255, 0.2) 0%, rgba(193, 255, 114, 0.2) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 12px rgba(100, 255, 218, 0.5);
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-placeholder text {
  font-size: 24rpx;
  color: #ffffff;
  font-weight: 600;
}

.message-bubble {
  padding: 20rpx 24rpx;
  border-radius: 20rpx;
  position: relative;
  max-width: 70%;
}

.message-bubble.assistant {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(193, 255, 114, 0.15);
  border-top-left-radius: 4rpx;
  box-shadow: 0 0 15px rgba(120, 255, 120, 0.3);
}

.message-bubble.user {
  background: linear-gradient(135deg, rgba(193, 255, 114, 0.15) 0%, rgba(0, 242, 255, 0.15) 100%);
  border: 1px solid rgba(193, 255, 114, 0.2);
  border-top-right-radius: 4rpx;
}

.message-item.thinking .message-bubble.assistant {
  animation: breathing 1.5s ease-in-out infinite;
}

.message-item.typing .message-bubble.assistant {
  border-color: rgba(193, 255, 114, 0.4);
}

@keyframes breathing {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.message-item.highlighted .message-bubble {
  animation: memory-flash 1s ease-out;
  box-shadow: 0 0 20px rgba(193, 255, 114, 0.5);
}

@keyframes memory-flash {
  0% { transform: scale(1.02); box-shadow: 0 0 30px rgba(193, 255, 114, 0.8); }
  100% { transform: scale(1); box-shadow: 0 0 15px rgba(120, 255, 120, 0.3); }
}

.message-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

.thinking-dots {
  display: flex;
  gap: 8rpx;
  padding: 4rpx 0;
}

.thinking-dots .dot {
  width: 12rpx;
  height: 12rpx;
  background: #C1FF72;
  border-radius: 50%;
  animation: typing-bounce 1s ease-in-out infinite;
}

.thinking-dots .dot:nth-child(1) { animation-delay: 0s; }
.thinking-dots .dot:nth-child(2) { animation-delay: 0.2s; }
.thinking-dots .dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing-bounce {
  0%, 100% { transform: translateY(0); opacity: 0.5; }
  50% { transform: translateY(-8rpx); opacity: 1; }
}

.message-time {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.3);
  margin-top: 8rpx;
  display: block;
  text-align: right;
}

.chat-input-area {
  padding: 16rpx 24rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: rgba(10, 10, 10, 0.95);
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

.reply-chip {
  padding: 12rpx 20rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  flex-shrink: 0;
}

.reply-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.input-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  transition: transform 0.3s ease;
}

.input-row.sending {
  animation: send-pulse 0.3s ease;
}

@keyframes send-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

.chat-input {
  flex: 1;
  height: 72rpx;
  padding: 0 24rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 36rpx;
  font-size: 28rpx;
  color: #ffffff;
  max-height: 120rpx;
}

.placeholder-text {
  color: rgba(255, 255, 255, 0.3);
}

.send-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #C1FF72 0%, #00F2FF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.send-btn:active {
  transform: scale(0.9);
}

.send-btn.disabled {
  opacity: 0.5;
}

.send-icon {
  font-size: 24rpx;
  color: #0A0A0A;
}

.date-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.date-picker {
  width: 80%;
  max-width: 500rpx;
  border-radius: 24rpx;
  padding: 24rpx;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.picker-title {
  font-size: 30rpx;
  color: #C1FF72;
  font-weight: 600;
}

.picker-close {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.6);
}

.picker-dates {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  max-height: 400rpx;
  overflow-y: auto;
}

.date-item {
  padding: 16rpx 24rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.date-item:active {
  background: rgba(193, 255, 114, 0.1);
  border-color: rgba(193, 255, 114, 0.3);
}

.date-label {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}
</style>
