<template>
  <view class="meta-editor-overlay" v-if="visible" @click.self="$emit('close')">
    <view class="meta-editor glass-panel">
      <view class="editor-header">
        <text class="editor-title font-mono">守护兽人格设定</text>
        <view class="close-btn" @click="$emit('close')">
          <text class="close-icon">×</text>
        </view>
      </view>

      <view class="editor-body">
        <view class="preview-section">
          <view class="preview-pet">
            <view class="mini-core" :style="{ '--pet-color': petColor.primary }">
              <view class="mini-eyes">
                <view class="mini-eye"></view>
                <view class="mini-eye"></view>
              </view>
            </view>
          </view>
          <text class="preview-name">{{ localName }}</text>
        </view>

        <view class="form-section">
          <view class="form-field">
            <text class="field-label">昵称</text>
            <input 
              class="field-input" 
              v-model="localName"
              placeholder="给你的守护兽起个名字"
              placeholder-class="placeholder-text"
            />
          </view>

          <view class="form-field">
            <text class="field-label">性格设定</text>
            <textarea 
              class="field-textarea"
              v-model="localPrompt"
              placeholder="描述守护兽的性格特点、说话风格..."
              placeholder-class="placeholder-text"
              :maxlength="500"
            />
            <text class="char-count">{{ localPrompt.length }}/500</text>
          </view>

          <view class="preset-section">
            <text class="preset-label">预设风格</text>
            <view class="preset-list">
              <view 
                class="preset-item" 
                v-for="preset in presets" 
                :key="preset.name"
                :class="{ active: localPrompt === preset.prompt }"
                @click="applyPreset(preset)"
              >
                <text class="preset-name">{{ preset.name }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="editor-footer">
        <view class="cancel-btn" @click="$emit('close')">
          <text class="btn-text">取消</text>
        </view>
        <view class="save-btn" @click="saveChanges">
          <text class="btn-text">保存</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSentinelStore } from '@/stores/sentinel'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', name: string, prompt: string): void
}>()

const sentinelStore = useSentinelStore()

const localName = ref(sentinelStore.name)
const localPrompt = ref(sentinelStore.personalityPrompt)

const petColor = computed(() => sentinelStore.petColor)

const presets = [
  {
    name: '星辰向导',
    prompt: '你是一个温和的向导，说话喜欢带星辰的隐喻。你是永恒的守护者，守护着主人的记忆。'
  },
  {
    name: '智慧长者',
    prompt: '你是一位充满智慧的长者，说话沉稳而有哲理。你见证了无数记忆的诞生与消逝。'
  },
  {
    name: '活泼精灵',
    prompt: '你是一个活泼可爱的精灵，说话充满活力和好奇心。你喜欢用明亮的比喻来描述事物。'
  },
  {
    name: '神秘先知',
    prompt: '你是一位神秘的先知，说话带有预言般的深邃。你能感知时间流逝中的微妙变化。'
  },
  {
    name: '高冷黑客',
    prompt: '你是一个冷静的黑客，说话简洁精准。你用代码和数据的隐喻来描述世界，对安全问题格外敏感。'
  },
  {
    name: '温柔诗人',
    prompt: '你是一位温柔的诗人，说话充满诗意和美感。你用自然和季节的意象来表达情感，每一句话都像一首小诗。'
  },
  {
    name: '严谨管家',
    prompt: '你是一位严谨的管家，说话礼貌而专业。你注重细节和秩序，总是以最恰当的方式照顾主人的需求。'
  }
]

watch(() => props.visible, (newVal) => {
  if (newVal) {
    localName.value = sentinelStore.name
    localPrompt.value = sentinelStore.personalityPrompt
  }
})

function applyPreset(preset: { name: string; prompt: string }) {
  localPrompt.value = preset.prompt
}

async function saveChanges() {
  if (!localName.value.trim()) {
    uni.showToast({ title: '请输入守护兽昵称', icon: 'none' })
    return
  }
  
  uni.showLoading({ title: '保存中...' })
  
  const success = await sentinelStore.updateConfig(localName.value, localPrompt.value)
  
  uni.hideLoading()
  
  if (success) {
    uni.showToast({ title: '保存成功', icon: 'success' })
    emit('save', localName.value, localPrompt.value)
    emit('close')
  } else {
    uni.showToast({ title: '保存失败', icon: 'none' })
  }
}
</script>

<style scoped>
.meta-editor-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.meta-editor {
  width: 90%;
  max-width: 600rpx;
  max-height: 80vh;
  border-radius: 32rpx;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%);
  border: 1px solid rgba(193, 255, 114, 0.2);
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.editor-title {
  font-size: 32rpx;
  color: #C1FF72;
  font-weight: 600;
}

.close-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
}

.close-icon {
  font-size: 36rpx;
  color: rgba(255, 255, 255, 0.6);
}

.editor-body {
  flex: 1;
  overflow-y: auto;
  padding: 24rpx 32rpx;
}

.preview-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 0;
  margin-bottom: 24rpx;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 20rpx;
}

.preview-pet {
  margin-bottom: 12rpx;
}

.mini-core {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(193, 255, 114, 0.3) 0%, rgba(0, 242, 255, 0.3) 100%);
  border: 2rpx solid var(--pet-color, #C1FF72);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: mini-breathe 3s ease-in-out infinite;
}

@keyframes mini-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.mini-eyes {
  display: flex;
  gap: 12rpx;
}

.mini-eye {
  width: 10rpx;
  height: 12rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
}

.preview-name {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 500;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.field-label {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
}

.field-input {
  padding: 20rpx 24rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #ffffff;
}

.field-textarea {
  padding: 20rpx 24rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #ffffff;
  min-height: 200rpx;
}

.placeholder-text {
  color: rgba(255, 255, 255, 0.3);
}

.char-count {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.4);
  text-align: right;
}

.preset-section {
  margin-top: 12rpx;
}

.preset-label {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 12rpx;
  display: block;
}

.preset-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.preset-item {
  padding: 12rpx 24rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
}

.preset-item.active {
  background: rgba(193, 255, 114, 0.1);
  border-color: rgba(193, 255, 114, 0.3);
}

.preset-name {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.preset-item.active .preset-name {
  color: #C1FF72;
}

.editor-footer {
  display: flex;
  gap: 20rpx;
  padding: 24rpx 32rpx;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.cancel-btn, .save-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.save-btn {
  background: linear-gradient(135deg, #C1FF72 0%, #00F2FF 100%);
}

.cancel-btn .btn-text {
  color: rgba(255, 255, 255, 0.7);
}

.save-btn .btn-text {
  color: #0A0A0A;
  font-weight: 600;
}

.btn-text {
  font-size: 28rpx;
}
</style>
