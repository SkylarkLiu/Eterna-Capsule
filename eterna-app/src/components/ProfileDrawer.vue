<template>
  <view class="profile-drawer" :class="{ visible: visible }" @click.self="close">
    <view class="drawer-content glass-panel" :class="{ open: visible }">
      <view class="drawer-header">
        <text class="header-title font-mono">个人资料</text>
        <view class="close-btn" @click="close">
          <text class="close-icon">×</text>
        </view>
      </view>

      <scroll-view class="drawer-body" scroll-y>
        <view class="avatar-section">
          <view class="avatar-container">
            <image 
              v-if="formData.avatarUrl" 
              :src="formData.avatarUrl" 
              class="avatar-image"
              mode="aspectFill"
            />
            <view v-else class="avatar-placeholder">
              <text class="avatar-text">{{ userStore.username.charAt(0) }}</text>
            </view>
            <view class="avatar-glow"></view>
          </view>
          <view class="avatar-upload">
            <text class="upload-text">更换头像</text>
          </view>
        </view>

        <view class="form-section">
          <view class="form-item" :class="{ focused: focusedField === 'username' }">
            <text class="form-label">用户名</text>
            <input 
              class="form-input"
              v-model="formData.username"
              placeholder="请输入用户名"
              placeholder-class="placeholder-text"
              @focus="focusedField = 'username'"
              @blur="focusedField = ''"
            />
          </view>

          <view class="form-item" :class="{ focused: focusedField === 'email' }">
            <text class="form-label">邮箱</text>
            <input 
              class="form-input"
              v-model="formData.email"
              placeholder="请输入邮箱"
              placeholder-class="placeholder-text"
              type="email"
              @focus="focusedField = 'email'"
              @blur="focusedField = ''"
            />
          </view>

          <view class="form-item" :class="{ focused: focusedField === 'phone' }">
            <text class="form-label">手机号</text>
            <input 
              class="form-input"
              v-model="formData.phone"
              placeholder="请输入手机号"
              placeholder-class="placeholder-text"
              type="number"
              @focus="focusedField = 'phone'"
              @blur="focusedField = ''"
            />
          </view>

          <view class="form-item" :class="{ focused: focusedField === 'motto' }">
            <text class="form-label">座右铭</text>
            <textarea 
              class="form-textarea"
              v-model="formData.motto"
              placeholder="写下你的座右铭..."
              placeholder-class="placeholder-text"
              :maxlength="200"
              @focus="focusedField = 'motto'"
              @blur="focusedField = ''"
            />
            <text class="char-count">{{ formData.motto?.length || 0 }}/200</text>
          </view>

          <view class="form-item" :class="{ focused: focusedField === 'avatarUrl' }">
            <text class="form-label">头像URL</text>
            <input 
              class="form-input"
              v-model="formData.avatarUrl"
              placeholder="请输入头像图片URL"
              placeholder-class="placeholder-text"
              @focus="focusedField = 'avatarUrl'"
              @blur="focusedField = ''"
            />
          </view>
        </view>

        <view class="error-message" v-if="errorMessage">
          <text class="error-text">{{ errorMessage }}</text>
        </view>

        <view class="success-message" v-if="successMessage">
          <text class="success-text">{{ successMessage }}</text>
        </view>
      </scroll-view>

      <view class="drawer-footer">
        <button class="cancel-btn" @click="close">
          <text class="btn-text">取消</text>
        </button>
        <button class="save-btn" :disabled="loading" @click="handleSave">
          <text class="btn-text" v-if="!loading">保存</text>
          <view class="loading-spinner" v-else>
            <view class="spinner-ring"></view>
          </view>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useUserStore } from '@/stores/user'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'close'): void
}>()

const userStore = useUserStore()

const loading = ref(false)
const focusedField = ref('')
const errorMessage = ref('')
const successMessage = ref('')

const formData = reactive({
  username: '',
  email: '',
  phone: '',
  motto: '',
  avatarUrl: '',
})

watch(() => props.visible, (newVal) => {
  if (newVal) {
    initFormData()
  }
})

function initFormData() {
  formData.username = userStore.user?.username || ''
  formData.email = userStore.user?.email || ''
  formData.phone = userStore.user?.phone || ''
  formData.motto = userStore.user?.motto || ''
  formData.avatarUrl = userStore.user?.avatarUrl || ''
  errorMessage.value = ''
  successMessage.value = ''
}

function close() {
  emit('update:visible', false)
  emit('close')
}

async function handleSave() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!formData.username) {
    errorMessage.value = '用户名不能为空'
    return
  }

  loading.value = true

  try {
    const result = await userStore.updateProfile({
      username: formData.username,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      motto: formData.motto || undefined,
      avatarUrl: formData.avatarUrl || undefined,
    })

    if (result.success) {
      successMessage.value = '保存成功'
      setTimeout(() => {
        close()
      }, 1500)
    } else {
      errorMessage.value = result.message || '保存失败'
    }
  } catch (error: any) {
    errorMessage.value = error.message || '网络错误'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.profile-drawer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.profile-drawer.visible {
  opacity: 1;
  visibility: visible;
}

.drawer-content {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 80%;
  max-width: 600rpx;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

.drawer-content.open {
  transform: translateX(0);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 40rpx;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-title {
  font-size: 32rpx;
  color: #ffffff;
  font-weight: 600;
  letter-spacing: 2rpx;
}

.close-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:active {
  background: rgba(255, 255, 255, 0.1);
}

.close-icon {
  font-size: 40rpx;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1;
}

.drawer-body {
  flex: 1;
  padding: 32rpx 40rpx;
  overflow-y: auto;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48rpx;
}

.avatar-container {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 16rpx;
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid rgba(193, 255, 114, 0.3);
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(193, 255, 114, 0.2) 0%, rgba(0, 242, 255, 0.2) 100%);
  border: 2px solid rgba(193, 255, 114, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  font-size: 64rpx;
  color: #C1FF72;
  font-weight: 600;
}

.avatar-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  box-shadow: 0 0 30rpx rgba(193, 255, 114, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

.avatar-upload {
  padding: 12rpx 24rpx;
  background: rgba(193, 255, 114, 0.1);
  border: 1px solid rgba(193, 255, 114, 0.3);
  border-radius: 20rpx;
}

.upload-text {
  font-size: 24rpx;
  color: #C1FF72;
}

.form-section {
  margin-bottom: 32rpx;
}

.form-item {
  margin-bottom: 24rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  padding: 16rpx 24rpx;
  transition: all 0.3s ease;
}

.form-item.focused {
  border-color: #00F2FF;
  box-shadow: 0 0 20rpx rgba(0, 242, 255, 0.2);
}

.form-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 8rpx;
  display: block;
}

.form-input {
  width: 100%;
  font-size: 28rpx;
  color: #ffffff;
  background: transparent;
  border: none;
  outline: none;
}

.form-textarea {
  width: 100%;
  height: 120rpx;
  font-size: 28rpx;
  color: #ffffff;
  background: transparent;
  border: none;
  outline: none;
}

.placeholder-text {
  color: rgba(255, 255, 255, 0.3);
}

.char-count {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.4);
  text-align: right;
  display: block;
  margin-top: 8rpx;
}

.error-message {
  padding: 16rpx 24rpx;
  background: rgba(255, 92, 0, 0.1);
  border: 1px solid rgba(255, 92, 0, 0.3);
  border-radius: 12rpx;
  margin-bottom: 24rpx;
}

.error-text {
  font-size: 24rpx;
  color: #FF5C00;
}

.success-message {
  padding: 16rpx 24rpx;
  background: rgba(193, 255, 114, 0.1);
  border: 1px solid rgba(193, 255, 114, 0.3);
  border-radius: 12rpx;
  margin-bottom: 24rpx;
}

.success-text {
  font-size: 24rpx;
  color: #C1FF72;
}

.drawer-footer {
  display: flex;
  gap: 24rpx;
  padding: 24rpx 40rpx;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.cancel-btn,
.save-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.cancel-btn .btn-text {
  color: rgba(255, 255, 255, 0.6);
}

.save-btn {
  background: linear-gradient(135deg, rgba(193, 255, 114, 0.2) 0%, rgba(0, 242, 255, 0.2) 100%);
  border: 1px solid rgba(193, 255, 114, 0.3);
}

.save-btn .btn-text {
  color: #C1FF72;
}

.save-btn[disabled] {
  opacity: 0.6;
}

.btn-text {
  font-size: 28rpx;
  font-weight: 500;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-ring {
  width: 36rpx;
  height: 36rpx;
  border: 3rpx solid rgba(193, 255, 114, 0.3);
  border-top-color: #C1FF72;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
