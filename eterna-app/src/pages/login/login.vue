<template>
  <view class="login-page">
    <view class="background-effects">
      <view class="star" v-for="i in 50" :key="i" :style="getStarStyle(i)"></view>
      <view class="glow-orb orb-1"></view>
      <view class="glow-orb orb-2"></view>
    </view>

    <view class="login-container glass-panel">
      <view class="logo-section">
        <view class="logo-glow"></view>
        <text class="logo-icon">◈</text>
        <text class="logo-title font-mono">永恒胶囊</text>
        <text class="logo-subtitle">ETERNA CAPSULE</text>
      </view>

      <view class="tab-switch">
        <view 
          class="tab-item" 
          :class="{ active: isLogin }" 
          @click="switchTab(true)"
        >
          <text class="tab-text">登录</text>
          <view class="tab-indicator" v-if="isLogin"></view>
        </view>
        <view 
          class="tab-item" 
          :class="{ active: !isLogin }" 
          @click="switchTab(false)"
        >
          <text class="tab-text">注册</text>
          <view class="tab-indicator" v-if="!isLogin"></view>
        </view>
      </view>

      <view class="form-section">
        <view class="input-group" :class="{ focused: focusedField === 'account' }">
          <text class="input-label">账号</text>
          <input 
            class="input-field"
            v-model="formData.account"
            :placeholder="isLogin ? '邮箱或手机号' : '邮箱（选填）'"
            placeholder-class="placeholder-text"
            @focus="focusedField = 'account'"
            @blur="focusedField = ''"
          />
        </view>

        <view class="input-group" v-if="!isLogin" :class="{ focused: focusedField === 'phone' }">
          <text class="input-label">手机号</text>
          <input 
            class="input-field"
            v-model="formData.phone"
            placeholder="手机号（选填）"
            placeholder-class="placeholder-text"
            type="number"
            @focus="focusedField = 'phone'"
            @blur="focusedField = ''"
          />
        </view>

        <view class="input-group" v-if="!isLogin" :class="{ focused: focusedField === 'username' }">
          <text class="input-label">用户名</text>
          <input 
            class="input-field"
            v-model="formData.username"
            placeholder="请输入用户名"
            placeholder-class="placeholder-text"
            @focus="focusedField = 'username'"
            @blur="focusedField = ''"
          />
        </view>

        <view class="input-group" :class="{ focused: focusedField === 'password' }">
          <text class="input-label">密码</text>
          <input 
            class="input-field"
            v-model="formData.password"
            placeholder="请输入密码"
            placeholder-class="placeholder-text"
            :password="!showPassword"
            @focus="focusedField = 'password'"
            @blur="focusedField = ''"
          />
          <view class="password-toggle" @click="showPassword = !showPassword">
            <text class="toggle-icon">{{ showPassword ? '👁' : '👁‍🗨' }}</text>
          </view>
        </view>

        <view class="input-group" v-if="!isLogin" :class="{ focused: focusedField === 'confirmPassword' }">
          <text class="input-label">确认密码</text>
          <input 
            class="input-field"
            v-model="formData.confirmPassword"
            placeholder="请再次输入密码"
            placeholder-class="placeholder-text"
            :password="!showPassword"
            @focus="focusedField = 'confirmPassword'"
            @blur="focusedField = ''"
          />
        </view>

        <view class="error-message" v-if="errorMessage">
          <text class="error-text">{{ errorMessage }}</text>
        </view>

        <button class="submit-btn" :disabled="loading" @click="handleSubmit">
          <view class="btn-glow"></view>
          <text class="btn-text" v-if="!loading">{{ isLogin ? '登录' : '注册' }}</text>
          <view class="loading-spinner" v-else>
            <view class="spinner-ring"></view>
          </view>
        </button>
      </view>

      <view class="footer-section">
        <text class="footer-text">守护你的数字记忆</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const isLogin = ref(true)
const loading = ref(false)
const showPassword = ref(false)
const focusedField = ref('')
const errorMessage = ref('')

const formData = reactive({
  account: '',
  phone: '',
  username: '',
  password: '',
  confirmPassword: '',
})

function switchTab(login: boolean) {
  isLogin.value = login
  errorMessage.value = ''
  formData.account = ''
  formData.phone = ''
  formData.username = ''
  formData.password = ''
  formData.confirmPassword = ''
}

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

function validateForm(): boolean {
  errorMessage.value = ''

  if (!formData.password) {
    errorMessage.value = '请输入密码'
    return false
  }

  if (formData.password.length < 6) {
    errorMessage.value = '密码长度不能少于6位'
    return false
  }

  if (isLogin.value) {
    if (!formData.account) {
      errorMessage.value = '请输入账号'
      return false
    }
  } else {
    if (!formData.account && !formData.phone) {
      errorMessage.value = '邮箱和手机号至少填写一项'
      return false
    }

    if (!formData.username) {
      errorMessage.value = '请输入用户名'
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      errorMessage.value = '两次输入的密码不一致'
      return false
    }
  }

  return true
}

async function handleSubmit() {
  if (!validateForm()) return

  loading.value = true
  errorMessage.value = ''

  try {
    let result
    
    if (isLogin.value) {
      result = await userStore.login({
        account: formData.account,
        password: formData.password,
      })
    } else {
      result = await userStore.register({
        email: formData.account || undefined,
        phone: formData.phone || undefined,
        username: formData.username,
        password: formData.password,
      })
    }

    if (result.success) {
      uni.showToast({
        title: isLogin.value ? '登录成功' : '注册成功',
        icon: 'success',
      })
      
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index',
        })
      }, 1500)
    } else {
      errorMessage.value = result.message || '操作失败'
    }
  } catch (error: any) {
    errorMessage.value = error.message || '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: radial-gradient(ellipse at center, #1A1A1A 0%, #0A0A0A 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
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
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60rpx);
  opacity: 0.3;
}

.orb-1 {
  width: 300rpx;
  height: 300rpx;
  background: #00F2FF;
  top: 10%;
  right: 10%;
  animation: float 8s ease-in-out infinite;
}

.orb-2 {
  width: 250rpx;
  height: 250rpx;
  background: #C1FF72;
  bottom: 20%;
  left: 5%;
  animation: float 10s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30rpx, -30rpx); }
}

.login-container {
  width: 100%;
  max-width: 640rpx;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 32rpx;
  padding: 48rpx 40rpx;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  position: relative;
  z-index: 1;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48rpx;
  position: relative;
}

.logo-glow {
  position: absolute;
  width: 120rpx;
  height: 120rpx;
  background: radial-gradient(circle, rgba(193, 255, 114, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  top: -20rpx;
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

.logo-icon {
  font-size: 64rpx;
  color: #C1FF72;
  text-shadow: 0 0 20rpx rgba(193, 255, 114, 0.5);
  margin-bottom: 16rpx;
}

.logo-title {
  font-size: 36rpx;
  color: #ffffff;
  font-weight: 600;
  letter-spacing: 4rpx;
  margin-bottom: 8rpx;
}

.logo-subtitle {
  font-size: 20rpx;
  color: rgba(255,255,255,0.5);
  letter-spacing: 6rpx;
}

.tab-switch {
  display: flex;
  justify-content: center;
  margin-bottom: 40rpx;
  background: rgba(255,255,255,0.05);
  border-radius: 16rpx;
  padding: 8rpx;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 32rpx;
  position: relative;
  transition: all 0.3s ease;
}

.tab-item.active .tab-text {
  color: #C1FF72;
}

.tab-text {
  font-size: 28rpx;
  color: rgba(255,255,255,0.6);
  transition: color 0.3s ease;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  width: 40rpx;
  height: 4rpx;
  background: #C1FF72;
  border-radius: 2rpx;
  box-shadow: 0 0 10rpx rgba(193, 255, 114, 0.5);
}

.form-section {
  margin-bottom: 32rpx;
}

.input-group {
  position: relative;
  margin-bottom: 24rpx;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16rpx;
  padding: 16rpx 24rpx;
  transition: all 0.3s ease;
}

.input-group.focused {
  border-color: #00F2FF;
  box-shadow: 0 0 20rpx rgba(0, 242, 255, 0.2);
}

.input-label {
  font-size: 22rpx;
  color: rgba(255,255,255,0.5);
  margin-bottom: 8rpx;
  display: block;
}

.input-field {
  width: 100%;
  font-size: 28rpx;
  color: #ffffff;
  background: transparent;
  border: none;
  outline: none;
}

.placeholder-text {
  color: rgba(255,255,255,0.3);
}

.password-toggle {
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  padding: 8rpx;
}

.toggle-icon {
  font-size: 32rpx;
  opacity: 0.6;
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

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, rgba(193, 255, 114, 0.2) 0%, rgba(0, 242, 255, 0.2) 100%);
  border: 1px solid rgba(193, 255, 114, 0.3);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.submit-btn:active {
  transform: scale(0.98);
}

.submit-btn[disabled] {
  opacity: 0.6;
}

.btn-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(193, 255, 114, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.btn-text {
  font-size: 32rpx;
  color: #C1FF72;
  font-weight: 500;
  letter-spacing: 4rpx;
  position: relative;
  z-index: 1;
}

.loading-spinner {
  position: relative;
  z-index: 1;
}

.spinner-ring {
  width: 40rpx;
  height: 40rpx;
  border: 3rpx solid rgba(193, 255, 114, 0.3);
  border-top-color: #C1FF72;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.footer-section {
  text-align: center;
  margin-top: 32rpx;
}

.footer-text {
  font-size: 22rpx;
  color: rgba(255,255,255,0.4);
  letter-spacing: 2rpx;
}
</style>
