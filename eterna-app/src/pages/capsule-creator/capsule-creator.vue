<template>
  <view class="creator-page">
    <view class="background-effects">
      <view class="star" v-for="i in 80" :key="i" :style="getStarStyle(i)"></view>
      <view class="glow-orb orb-1"></view>
      <view class="glow-orb orb-2"></view>
    </view>

    <view class="particle-container" v-if="showParticleEffect">
      <view 
        v-for="particle in particles" 
        :key="particle.id" 
        class="particle"
        :style="particle.style"
      ></view>
    </view>

    <EncryptionProgress 
      :visible="showEncryptionProgress"
      :progress="encryptionProgress"
      :phase="encryptionPhase"
    />

    <view class="creator-container glass-panel" :class="{ 'sealing': isSealing }">
      <view class="header">
        <view class="back-btn" @click="goBack">
          <text class="back-icon">←</text>
        </view>
        <text class="title font-mono">创建胶囊</text>
        <view class="step-indicator">
          <view class="step-dot" :class="{ active: currentStep >= 1 }"></view>
          <view class="step-line" :class="{ active: currentStep >= 2 }"></view>
          <view class="step-dot" :class="{ active: currentStep >= 2 }"></view>
          <view class="step-line" :class="{ active: currentStep >= 3 }"></view>
          <view class="step-dot" :class="{ active: currentStep >= 3 }"></view>
          <view class="step-line" :class="{ active: currentStep >= 4 }"></view>
          <view class="step-dot" :class="{ active: currentStep >= 4 }"></view>
        </view>
      </view>

      <view class="content-area">
        <view class="step-content" v-if="currentStep === 1">
          <text class="step-title">写下你的感言</text>
          <text class="step-desc">这些文字将被封存，直到指定时间</text>
          
          <view class="input-area glass-input">
            <textarea 
              class="content-input"
              v-model="capsuleData.content"
              placeholder="在这里写下你想说的话..."
              placeholder-class="placeholder-text"
              :maxlength="5000"
              auto-height
              @input="updateContentCount"
            />
            <view class="input-footer">
              <text class="char-count">{{ contentCount }}/5000</text>
            </view>
          </view>

          <view class="title-input-area">
            <text class="input-label">胶囊标题</text>
            <input 
              class="title-input glass-input"
              v-model="capsuleData.title"
              placeholder="给这个胶囊起个名字"
              placeholder-class="placeholder-text"
              :maxlength="100"
            />
          </view>
        </view>

        <view class="step-content" v-if="currentStep === 2">
          <text class="step-title">添加媒体</text>
          <text class="step-desc">图片或视频将为你的记忆增添色彩</text>

          <view class="media-grid">
            <view 
              class="media-item" 
              v-for="(media, index) in mediaList" 
              :key="index"
            >
              <image 
                v-if="media.type === 'image'" 
                class="media-preview" 
                :src="media.url" 
                mode="aspectFill"
              />
              <view v-else class="video-preview">
                <image class="media-preview" :src="media.thumbnail" mode="aspectFill" />
                <view class="play-icon">▶</view>
              </view>
              <view class="upload-progress" v-if="media.uploading">
                <view class="progress-bar" :style="{ width: media.progress + '%' }"></view>
              </view>
              <view class="remove-btn" @click="removeMedia(index)">
                <text class="remove-icon">×</text>
              </view>
            </view>

            <view class="add-media-btn" @click="chooseMedia" v-if="mediaList.length < 9">
              <text class="add-icon">+</text>
              <text class="add-text">添加</text>
            </view>
          </view>

          <view class="type-selector">
            <text class="selector-label">胶囊类型</text>
            <view class="type-options">
              <view 
                class="type-option" 
                :class="{ active: capsuleData.type === 'TEXT' }"
                @click="capsuleData.type = 'TEXT'"
              >
                <text class="type-icon">📝</text>
                <text class="type-name">文字</text>
              </view>
              <view 
                class="type-option" 
                :class="{ active: capsuleData.type === 'IMAGE' }"
                @click="capsuleData.type = 'IMAGE'"
              >
                <text class="type-icon">🖼</text>
                <text class="type-name">图片</text>
              </view>
              <view 
                class="type-option" 
                :class="{ active: capsuleData.type === 'VIDEO' }"
                @click="capsuleData.type = 'VIDEO'"
              >
                <text class="type-icon">🎬</text>
                <text class="type-name">视频</text>
              </view>
            </view>
          </view>
        </view>

        <view class="step-content" v-if="currentStep === 3">
          <text class="step-title">信使指派</text>
          <text class="step-desc">你希望守护兽将记忆带给谁？</text>

          <view class="sentinel-area">
            <SentinelMini 
              :isComplete="isRecipientComplete" 
              :isAcknowledging="showAcknowledge"
            />
          </view>

          <view class="recipient-input-area glass-card">
            <view class="recipient-options">
              <view 
                class="recipient-option"
                :class="{ active: isSelfRecipient }"
                @click="selectSelfRecipient"
              >
                <text class="option-icon">👤</text>
                <text class="option-text">我自己</text>
              </view>
              <view 
                class="recipient-option"
                :class="{ active: !isSelfRecipient && capsuleData.recipientName }"
                @click="focusRecipientInput"
              >
                <text class="option-icon">💌</text>
                <text class="option-text">其他人</text>
              </view>
            </view>

            <view class="recipient-name-input" v-if="!isSelfRecipient">
              <input 
                class="name-input glass-input"
                v-model="capsuleData.recipientName"
                placeholder="输入接收人的名字"
                placeholder-class="placeholder-text"
                :maxlength="50"
              />
            </view>
          </view>

          <view class="contact-section" v-if="!isSelfRecipient && capsuleData.recipientName">
            <text class="section-title">选择联系方式</text>
            
            <view class="contact-methods">
              <view 
                class="contact-method"
                :class="{ active: capsuleData.contactMethod === 'EMAIL' }"
                @click="selectContactMethod('EMAIL')"
              >
                <text class="method-icon">📧</text>
                <text class="method-name">邮箱</text>
              </view>
              <view 
                class="contact-method"
                :class="{ active: capsuleData.contactMethod === 'PHONE' }"
                @click="selectContactMethod('PHONE')"
              >
                <text class="method-icon">📱</text>
                <text class="method-name">手机</text>
              </view>
              <view 
                class="contact-method"
                :class="{ active: capsuleData.contactMethod === 'QQ' }"
                @click="selectContactMethod('QQ')"
              >
                <text class="method-icon">💬</text>
                <text class="method-name">QQ</text>
              </view>
              <view 
                class="contact-method"
                :class="{ active: capsuleData.contactMethod === 'WECHAT' }"
                @click="selectContactMethod('WECHAT')"
              >
                <text class="method-icon">💚</text>
                <text class="method-name">微信</text>
              </view>
            </view>

            <view class="contact-value-input glass-card" v-if="capsuleData.contactMethod">
              <input 
                class="value-input"
                v-model="capsuleData.contactValue"
                :placeholder="getContactPlaceholder"
                placeholder-class="placeholder-text"
                :maxlength="200"
              />
              <text class="contact-hint" v-if="contactError">{{ contactError }}</text>
            </view>
          </view>
        </view>

        <view class="step-content" v-if="currentStep === 4">
          <text class="step-title">设置封存条件</text>
          <text class="step-desc">选择何时开启这个胶囊</text>

          <view class="trigger-type-selector">
            <view 
              class="trigger-option glass-card"
              :class="{ active: capsuleData.triggerType === 'TIME' }"
              @click="capsuleData.triggerType = 'TIME'"
            >
              <view class="trigger-icon-wrap">
                <text class="trigger-icon">⏰</text>
              </view>
              <text class="trigger-name">定时开启</text>
              <text class="trigger-desc">在指定日期自动开启</text>
            </view>

            <view 
              class="trigger-option glass-card"
              :class="{ active: capsuleData.triggerType === 'INACTIVITY' }"
              @click="capsuleData.triggerType = 'INACTIVITY'"
            >
              <view class="trigger-icon-wrap">
                <text class="trigger-icon">💔</text>
              </view>
              <text class="trigger-name">死信开关</text>
              <text class="trigger-desc">长时间未活动后开启</text>
            </view>
          </view>

          <view class="trigger-config glass-card" v-if="capsuleData.triggerType === 'TIME'">
            <text class="config-title">选择开启日期</text>
            <picker 
              mode="date" 
              :value="triggerDateStr" 
              :start="minDate"
              @change="onDateChange"
              class="date-picker"
            >
              <view class="picker-display">
                <text class="picker-value">{{ formatDisplayDate(capsuleData.triggerDate) }}</text>
                <text class="picker-arrow">›</text>
              </view>
            </picker>
          </view>

          <view class="trigger-config glass-card" v-if="capsuleData.triggerType === 'INACTIVITY'">
            <text class="config-title">宽限天数</text>
            <text class="config-desc">超过 {{ capsuleData.graceDays }} 天未活动后开启</text>
            <slider 
              class="grace-slider"
              :value="capsuleData.graceDays"
              :min="7"
              :max="365"
              :step="1"
              @change="onGraceDaysChange"
              activeColor="#C1FF72"
              backgroundColor="rgba(255,255,255,0.1)"
              block-size="24"
            />
            <view class="slider-labels">
              <text class="slider-label">7天</text>
              <text class="slider-label">365天</text>
            </view>
            
            <view class="inactivity-warning" v-if="!isSelfRecipient">
              <text class="warning-icon">⚠️</text>
              <text class="warning-text">死信开关模式下，接收人信息将用于在触发时通知对方</text>
            </view>
          </view>
        </view>
      </view>

      <view class="footer-actions">
        <button 
          class="nav-btn prev-btn" 
          v-if="currentStep > 1"
          @click="prevStep"
        >
          <text class="btn-text">上一步</text>
        </button>

        <button 
          class="nav-btn next-btn" 
          v-if="currentStep < 4"
          @click="nextStep"
          :disabled="!canProceed"
        >
          <text class="btn-text">下一步</text>
        </button>

        <button 
          class="seal-btn" 
          v-if="currentStep === 4"
          @click="sealCapsule"
          :disabled="isSealing"
        >
          <view class="btn-glow"></view>
          <text class="btn-text">{{ isSealing ? '封装中...' : '封装胶囊' }}</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useCapsuleStore } from '@/stores/capsule'
import { useUserStore } from '@/stores/user'
import type { CapsuleType, TriggerType, ContactMethod } from '@/api/types'
import SentinelMini from '@/components/SentinelMini.vue'
import EncryptionProgress from '@/components/EncryptionProgress.vue'
import { CryptoService, useCrypto } from '@/utils/crypto'

interface MediaItem {
  url: string
  type: 'image' | 'video'
  thumbnail?: string
  uploading?: boolean
  progress?: number
}

interface Particle {
  id: number
  style: Record<string, string>
}

const capsuleStore = useCapsuleStore()
const userStore = useUserStore()
const crypto = useCrypto()

const currentStep = ref(1)
const isSealing = ref(false)
const showParticleEffect = ref(false)
const particles = ref<Particle[]>([])
const mediaList = ref<MediaItem[]>([])
const contentCount = ref(0)
const showAcknowledge = ref(false)
const contactError = ref('')

const showEncryptionProgress = ref(false)
const encryptionProgress = ref(0)
const encryptionPhase = ref<'idle' | 'keygen' | 'encrypting' | 'uploading' | 'complete'>('idle')
const encryptionPassword = ref('')

const capsuleData = reactive({
  title: '',
  content: '',
  type: 'TEXT' as CapsuleType,
  triggerType: 'TIME' as TriggerType,
  triggerDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  graceDays: 30,
  mediaUrls: [] as string[],
  recipientName: '',
  contactMethod: null as ContactMethod | null,
  contactValue: '',
})

const isSelfRecipient = computed(() => capsuleData.recipientName === '我自己')

const isRecipientComplete = computed(() => {
  if (isSelfRecipient.value) return true
  if (!capsuleData.recipientName) return false
  if (!capsuleData.contactMethod) return false
  if (!capsuleData.contactValue) return false
  return !contactError.value
})

watch(isRecipientComplete, (newVal) => {
  if (newVal) {
    showAcknowledge.value = true
    setTimeout(() => {
      showAcknowledge.value = false
    }, 2000)
  }
})

const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const triggerDateStr = computed(() => {
  return capsuleData.triggerDate.toISOString().split('T')[0]
})

const getContactPlaceholder = computed(() => {
  const placeholders: Record<ContactMethod, string> = {
    EMAIL: '请输入邮箱地址',
    PHONE: '请输入手机号码',
    QQ: '请输入QQ号码',
    WECHAT: '请输入微信号',
  }
  return capsuleData.contactMethod ? placeholders[capsuleData.contactMethod] : ''
})

const canProceed = computed(() => {
  if (currentStep.value === 1) {
    return capsuleData.content.trim().length > 0 && capsuleData.title.trim().length > 0
  }
  if (currentStep.value === 2) {
    return true
  }
  if (currentStep.value === 3) {
    return isRecipientComplete.value
  }
  if (currentStep.value === 4) {
    if (capsuleData.triggerType === 'TIME') {
      return capsuleData.triggerDate > new Date()
    }
    if (capsuleData.triggerType === 'INACTIVITY') {
      if (!isSelfRecipient.value && !isRecipientComplete.value) {
        return false
      }
      return capsuleData.graceDays > 0
    }
  }
  return true
})

function getStarStyle(index: number) {
  const size = Math.random() * 3 + 1
  const left = Math.random() * 100
  const top = Math.random() * 100
  const delay = Math.random() * 3
  const duration = Math.random() * 2 + 2
  
  return {
    width: `${size}rpx`,
    height: `${size}rpx`,
    left: `${left}%`,
    top: `${top}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  }
}

function updateContentCount() {
  contentCount.value = capsuleData.content.length
}

function formatDisplayDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}年${month}月${day}日`
}

function onDateChange(e: any) {
  capsuleData.triggerDate = new Date(e.detail.value)
}

function onGraceDaysChange(e: any) {
  capsuleData.graceDays = e.detail.value
}

function selectSelfRecipient() {
  capsuleData.recipientName = '我自己'
  capsuleData.contactMethod = null
  capsuleData.contactValue = ''
  contactError.value = ''
}

function focusRecipientInput() {
  capsuleData.recipientName = ''
}

function selectContactMethod(method: ContactMethod) {
  capsuleData.contactMethod = method
  capsuleData.contactValue = ''
  contactError.value = ''
}

watch(() => capsuleData.contactValue, (value) => {
  if (!value || !capsuleData.contactMethod) {
    contactError.value = ''
    return
  }
  
  switch (capsuleData.contactMethod) {
    case 'EMAIL':
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        contactError.value = '请输入有效的邮箱地址'
      } else {
        contactError.value = ''
      }
      break
    case 'PHONE':
      if (!/^1[3-9]\d{9}$/.test(value)) {
        contactError.value = '请输入有效的手机号码'
      } else {
        contactError.value = ''
      }
      break
    case 'QQ':
      if (!/^\d{5,12}$/.test(value)) {
        contactError.value = '请输入有效的QQ号码'
      } else {
        contactError.value = ''
      }
      break
    case 'WECHAT':
      if (!/^[a-zA-Z][a-zA-Z0-9_-]{5,19}$/.test(value)) {
        contactError.value = '请输入有效的微信号'
      } else {
        contactError.value = ''
      }
      break
  }
})

function chooseMedia() {
  uni.chooseMedia({
    count: 9 - mediaList.value.length,
    mediaType: ['image', 'video'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      res.tempFiles.forEach((file) => {
        const mediaItem: MediaItem = {
          url: file.tempFilePath,
          type: file.fileType as 'image' | 'video',
          uploading: true,
          progress: 0,
        }
        
        if (file.fileType === 'video' && file.thumbTempFilePath) {
          mediaItem.thumbnail = file.thumbTempFilePath
        }
        
        mediaList.value.push(mediaItem)
        
        simulateUpload(mediaList.value.length - 1)
      })
    },
  })
}

function simulateUpload(index: number) {
  let progress = 0
  const interval = setInterval(() => {
    progress += Math.random() * 20
    if (progress >= 100) {
      progress = 100
      mediaList.value[index].uploading = false
      clearInterval(interval)
    }
    mediaList.value[index].progress = progress
  }, 200)
}

function removeMedia(index: number) {
  mediaList.value.splice(index, 1)
}

function nextStep() {
  if (currentStep.value < 4 && canProceed.value) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

function goBack() {
  uni.navigateBack()
}

function createParticles() {
  const newParticles: Particle[] = []
  for (let i = 0; i < 60; i++) {
    const angle = (Math.PI * 2 * i) / 60
    const startX = 50 + Math.cos(angle) * 40
    const startY = 50 + Math.sin(angle) * 40
    const endX = 50
    const endY = 50
    
    newParticles.push({
      id: i,
      style: {
        '--start-x': `${startX}%`,
        '--start-y': `${startY}%`,
        '--end-x': `${endX}%`,
        '--end-y': `${endY}%`,
        animationDelay: `${Math.random() * 0.5}s`,
      },
    })
  }
  particles.value = newParticles
}

async function sealCapsule() {
  if (!canProceed.value || isSealing.value) return

  isSealing.value = true
  showEncryptionProgress.value = true
  encryptionProgress.value = 0
  encryptionPhase.value = 'keygen'

  capsuleData.mediaUrls = mediaList.value.map(m => m.url)

  try {
    encryptionProgress.value = 10
    
    const password = userStore.user?.id + '_' + Date.now()
    const { key, salt } = await CryptoService.deriveKey(password)
    CryptoService.storeKey(userStore.user!.id, key)
    
    encryptionProgress.value = 30
    encryptionPhase.value = 'encrypting'
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const encryptedContent = await CryptoService.encryptContent(capsuleData.content, key)
    
    encryptionProgress.value = 50
    
    let encryptedMediaUrls: string[] = []
    if (mediaList.value.length > 0) {
      for (let i = 0; i < mediaList.value.length; i++) {
        const progress = 50 + (i / mediaList.value.length) * 20
        encryptionProgress.value = progress
        encryptedMediaUrls.push(mediaList.value[i].url)
      }
    }
    
    encryptionProgress.value = 75
    encryptionPhase.value = 'uploading'
    
    const createParams = {
      title: capsuleData.title,
      content: encryptedContent.ciphertext,
      mediaUrls: encryptedMediaUrls,
      type: capsuleData.type,
      triggerType: capsuleData.triggerType,
      triggerDate: capsuleData.triggerType === 'TIME' 
        ? capsuleData.triggerDate.toISOString() 
        : undefined,
      graceDays: capsuleData.triggerType === 'INACTIVITY' 
        ? capsuleData.graceDays 
        : undefined,
      recipientName: isSelfRecipient.value ? undefined : capsuleData.recipientName,
      contactMethod: isSelfRecipient.value ? undefined : capsuleData.contactMethod || undefined,
      contactValue: isSelfRecipient.value ? undefined : capsuleData.contactValue || undefined,
      encrypted: true,
      iv: encryptedContent.iv,
      salt: salt,
    }

    const createResult = await capsuleStore.createCapsule(createParams)
    
    if (!createResult.success) {
      throw new Error(createResult.message)
    }

    encryptionProgress.value = 90

    const sealResult = await capsuleStore.sealCapsule(createResult.data!.id)
    
    if (!sealResult.success) {
      throw new Error(sealResult.message)
    }
    
    encryptionProgress.value = 100
    encryptionPhase.value = 'complete'
    
    showParticleEffect.value = true
    createParticles()
    
    uni.showToast({
      title: '加密封装成功',
      icon: 'success',
    })

    setTimeout(() => {
      uni.navigateBack()
    }, 2000)
  } catch (error: any) {
    uni.showToast({
      title: error.message || '封装失败',
      icon: 'none',
    })
    showEncryptionProgress.value = false
  } finally {
    isSealing.value = false
  }
}
</script>

<style scoped>
.creator-page {
  min-height: 100vh;
  background: radial-gradient(ellipse at center, #1A1A1A 0%, #0A0A0A 100%);
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
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.3); }
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
  bottom: 10%;
  left: -5%;
  animation: float 12s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(40rpx, -40rpx); }
}

.particle-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 100;
}

.particle {
  position: absolute;
  width: 8rpx;
  height: 8rpx;
  background: #C1FF72;
  border-radius: 50%;
  box-shadow: 0 0 20rpx #C1FF72, 0 0 40rpx #00F2FF;
  animation: particle-contract 2s ease-in forwards;
  left: var(--start-x);
  top: var(--start-y);
}

@keyframes particle-contract {
  0% {
    left: var(--start-x);
    top: var(--start-y);
    opacity: 1;
    transform: scale(1);
  }
  100% {
    left: var(--end-x);
    top: var(--end-y);
    opacity: 0;
    transform: scale(0);
  }
}

.creator-container {
  min-height: 100vh;
  padding: 0 32rpx 160rpx;
  position: relative;
  z-index: 1;
  transition: all 0.5s ease;
}

.creator-container.sealing {
  filter: blur(5px);
  opacity: 0.7;
}

.glass-panel {
  background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.1);
}

.header {
  display: flex;
  align-items: center;
  padding: 60rpx 0 40rpx;
  position: relative;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 50%;
}

.back-icon {
  font-size: 32rpx;
  color: rgba(255,255,255,0.8);
}

.title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  color: #ffffff;
  font-weight: 600;
  letter-spacing: 4rpx;
}

.step-indicator {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.step-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  transition: all 0.3s ease;
}

.step-dot.active {
  background: #C1FF72;
  box-shadow: 0 0 10rpx rgba(193, 255, 114, 0.5);
}

.step-line {
  width: 40rpx;
  height: 4rpx;
  background: rgba(255,255,255,0.1);
  border-radius: 2rpx;
  transition: all 0.3s ease;
}

.step-line.active {
  background: linear-gradient(90deg, #C1FF72, #00F2FF);
}

.content-area {
  padding: 20rpx 0;
}

.step-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.step-title {
  font-size: 40rpx;
  color: #ffffff;
  font-weight: 600;
  display: block;
  margin-bottom: 12rpx;
}

.step-desc {
  font-size: 26rpx;
  color: rgba(255,255,255,0.5);
  display: block;
  margin-bottom: 40rpx;
}

.glass-input {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20rpx;
  transition: all 0.3s ease;
}

.input-area {
  padding: 24rpx;
  margin-bottom: 32rpx;
}

.content-input {
  width: 100%;
  min-height: 300rpx;
  font-size: 30rpx;
  color: #ffffff;
  line-height: 1.8;
}

.placeholder-text {
  color: rgba(255,255,255,0.3);
}

.input-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.char-count {
  font-size: 24rpx;
  color: rgba(255,255,255,0.4);
}

.title-input-area {
  margin-bottom: 32rpx;
}

.input-label {
  font-size: 26rpx;
  color: rgba(255,255,255,0.6);
  display: block;
  margin-bottom: 16rpx;
}

.title-input {
  padding: 24rpx;
  font-size: 30rpx;
  color: #ffffff;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  margin-bottom: 40rpx;
}

.media-item {
  aspect-ratio: 1;
  border-radius: 16rpx;
  overflow: hidden;
  position: relative;
  background: rgba(255,255,255,0.05);
}

.media-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-preview {
  width: 100%;
  height: 100%;
  position: relative;
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 40rpx;
  color: #ffffff;
  opacity: 0.8;
}

.upload-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 6rpx;
  background: rgba(0,0,0,0.5);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #C1FF72, #00F2FF);
  transition: width 0.2s ease;
}

.remove-btn {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 44rpx;
  height: 44rpx;
  background: rgba(0,0,0,0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-icon {
  font-size: 28rpx;
  color: #ffffff;
}

.add-media-btn {
  aspect-ratio: 1;
  border-radius: 16rpx;
  border: 2rpx dashed rgba(255,255,255,0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  transition: all 0.3s ease;
}

.add-media-btn:active {
  border-color: #C1FF72;
  background: rgba(193, 255, 114, 0.1);
}

.add-icon {
  font-size: 48rpx;
  color: rgba(255,255,255,0.4);
}

.add-text {
  font-size: 24rpx;
  color: rgba(255,255,255,0.4);
}

.type-selector {
  margin-top: 32rpx;
}

.selector-label {
  font-size: 26rpx;
  color: rgba(255,255,255,0.6);
  display: block;
  margin-bottom: 16rpx;
}

.type-options {
  display: flex;
  gap: 16rpx;
}

.type-option {
  flex: 1;
  padding: 24rpx;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  transition: all 0.3s ease;
}

.type-option.active {
  border-color: #C1FF72;
  background: rgba(193, 255, 114, 0.1);
}

.type-icon {
  font-size: 40rpx;
}

.type-name {
  font-size: 24rpx;
  color: rgba(255,255,255,0.8);
}

.sentinel-area {
  display: flex;
  justify-content: center;
  margin-bottom: 32rpx;
}

.recipient-input-area {
  padding: 24rpx;
  margin-bottom: 32rpx;
}

.recipient-options {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.recipient-option {
  flex: 1;
  padding: 24rpx;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  transition: all 0.3s ease;
}

.recipient-option.active {
  border-color: #C1FF72;
  background: rgba(193, 255, 114, 0.1);
}

.option-icon {
  font-size: 36rpx;
}

.option-text {
  font-size: 26rpx;
  color: rgba(255,255,255,0.8);
}

.recipient-name-input {
  margin-top: 16rpx;
}

.name-input {
  padding: 24rpx;
  font-size: 30rpx;
  color: #ffffff;
  width: 100%;
}

.contact-section {
  margin-top: 32rpx;
}

.section-title {
  font-size: 26rpx;
  color: rgba(255,255,255,0.6);
  display: block;
  margin-bottom: 16rpx;
}

.contact-methods {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.contact-method {
  padding: 20rpx 12rpx;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  transition: all 0.3s ease;
}

.contact-method.active {
  border-color: #00F2FF;
  background: rgba(0, 242, 255, 0.1);
}

.method-icon {
  font-size: 32rpx;
}

.method-name {
  font-size: 22rpx;
  color: rgba(255,255,255,0.8);
}

.contact-value-input {
  padding: 24rpx;
}

.value-input {
  width: 100%;
  font-size: 30rpx;
  color: #ffffff;
  padding: 16rpx;
  background: rgba(255,255,255,0.05);
  border-radius: 12rpx;
}

.contact-hint {
  display: block;
  font-size: 22rpx;
  color: #FF5C00;
  margin-top: 12rpx;
}

.trigger-type-selector {
  display: flex;
  gap: 20rpx;
  margin-bottom: 32rpx;
}

.trigger-option {
  flex: 1;
  padding: 32rpx 24rpx;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
}

.trigger-option.active {
  border-color: #00F2FF;
  background: rgba(0, 242, 255, 0.1);
}

.trigger-icon-wrap {
  width: 80rpx;
  height: 80rpx;
  background: rgba(255,255,255,0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
}

.trigger-icon {
  font-size: 40rpx;
}

.trigger-name {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.trigger-desc {
  font-size: 22rpx;
  color: rgba(255,255,255,0.5);
  text-align: center;
}

.trigger-config {
  padding: 32rpx;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20rpx;
}

.config-title {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 500;
  display: block;
  margin-bottom: 20rpx;
}

.config-desc {
  font-size: 26rpx;
  color: rgba(255,255,255,0.6);
  display: block;
  margin-bottom: 20rpx;
}

.date-picker {
  width: 100%;
}

.picker-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12rpx;
}

.picker-value {
  font-size: 30rpx;
  color: #C1FF72;
}

.picker-arrow {
  font-size: 32rpx;
  color: rgba(255,255,255,0.4);
}

.grace-slider {
  margin: 20rpx 0;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
}

.slider-label {
  font-size: 22rpx;
  color: rgba(255,255,255,0.4);
}

.inactivity-warning {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 20rpx;
  padding: 16rpx;
  background: rgba(255, 92, 0, 0.1);
  border-radius: 12rpx;
}

.warning-icon {
  font-size: 24rpx;
}

.warning-text {
  font-size: 22rpx;
  color: rgba(255,255,255,0.6);
  flex: 1;
}

.footer-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: linear-gradient(to top, rgba(10,10,10,0.95), transparent);
  display: flex;
  gap: 20rpx;
}

.nav-btn {
  flex: 1;
  height: 88rpx;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.prev-btn {
  flex: 0.6;
}

.next-btn {
  flex: 1;
  background: linear-gradient(135deg, rgba(193, 255, 114, 0.2) 0%, rgba(0, 242, 255, 0.2) 100%);
  border-color: rgba(193, 255, 114, 0.3);
}

.next-btn[disabled] {
  opacity: 0.4;
}

.seal-btn {
  flex: 1;
  height: 88rpx;
  background: linear-gradient(135deg, rgba(193, 255, 114, 0.3) 0%, rgba(0, 242, 255, 0.3) 100%);
  border: 1px solid rgba(193, 255, 114, 0.5);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.seal-btn[disabled] {
  opacity: 0.6;
}

.btn-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(193, 255, 114, 0.4), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.btn-text {
  font-size: 30rpx;
  color: #C1FF72;
  font-weight: 500;
  letter-spacing: 2rpx;
  position: relative;
  z-index: 1;
}

.glass-card {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20rpx;
}
</style>
