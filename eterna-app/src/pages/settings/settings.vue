<template>
  <view class="settings-page">
    <view class="page-header">
      <text class="page-title font-mono">设置</text>
      <text class="page-subtitle">SETTINGS</text>
    </view>

    <view class="user-section" v-if="userStore.isLoggedIn">
      <view class="user-card glass-panel" @click="openProfileDrawer">
        <view class="user-avatar">
          <image 
            v-if="userStore.avatarUrl" 
            :src="userStore.avatarUrl" 
            class="avatar-image"
            mode="aspectFill"
          />
          <view v-else class="avatar-placeholder">
            <text class="avatar-text">{{ userStore.username.charAt(0) }}</text>
          </view>
          <view class="avatar-glow"></view>
        </view>
        <view class="user-info">
          <text class="user-name font-mono">{{ userStore.username }}</text>
          <text class="user-motto" v-if="userStore.motto">{{ userStore.motto }}</text>
          <text class="user-motto" v-else>点击编辑个人资料</text>
        </view>
        <text class="edit-arrow">›</text>
      </view>
    </view>

    <view class="user-section" v-else>
      <view class="login-card glass-panel" @click="goToLogin">
        <view class="login-icon">
          <text class="icon-text">👤</text>
        </view>
        <view class="login-info">
          <text class="login-title">登录 / 注册</text>
          <text class="login-desc">登录后解锁全部功能</text>
        </view>
        <text class="login-arrow">›</text>
      </view>
    </view>

    <view class="settings-section">
      <view class="section-title">
        <text class="title-text">账户</text>
        <view class="title-line"></view>
      </view>
      
      <view class="settings-list glass-panel">
        <view class="settings-item" @click="openProfileDrawer">
          <view class="item-left">
            <text class="item-icon">👤</text>
            <text class="item-label">个人资料</text>
          </view>
          <text class="item-arrow">›</text>
        </view>
        
        <view class="settings-item" @click="changePassword">
          <view class="item-left">
            <text class="item-icon">🔐</text>
            <text class="item-label">修改密码</text>
          </view>
          <text class="item-arrow">›</text>
        </view>
        
        <view class="settings-item">
          <view class="item-left">
            <text class="item-icon">🖐️</text>
            <text class="item-label">生物识别</text>
          </view>
          <switch :checked="biometricEnabled" @change="toggleBiometric" color="#C1FF72" />
        </view>
        
        <view class="settings-item" @click="openLLMConfigDrawer">
          <view class="item-left">
            <text class="item-icon">🧠</text>
            <text class="item-label">智脑配置</text>
          </view>
          <text class="item-arrow">›</text>
        </view>
      </view>
    </view>

    <view class="settings-section">
      <view class="section-title">
        <text class="title-text">心跳</text>
        <view class="title-line"></view>
      </view>
      
      <view class="settings-list glass-panel">
        <view class="settings-item">
          <view class="item-left">
            <text class="item-icon">⏱️</text>
            <text class="item-label">失联阈值</text>
          </view>
          <picker mode="selector" :range="thresholdOptions" @change="onThresholdChange">
            <view class="picker-value">
              <text class="value-text">{{ currentThreshold }}</text>
              <text class="item-arrow">›</text>
            </view>
          </picker>
        </view>
        
        <view class="settings-item">
          <view class="item-left">
            <text class="item-icon">🔔</text>
            <text class="item-label">通知方式</text>
          </view>
          <text class="item-value">邮件、推送</text>
        </view>
      </view>
    </view>

    <view class="settings-section">
      <view class="section-title">
        <text class="title-text">安全</text>
        <view class="title-line"></view>
      </view>
      
      <view class="settings-list glass-panel">
        <view class="settings-item" @click="manageKeys">
          <view class="item-left">
            <text class="item-icon">🔑</text>
            <text class="item-label">加密密钥</text>
          </view>
          <text class="item-arrow">›</text>
        </view>
        
        <view class="settings-item" @click="exportData">
          <view class="item-left">
            <text class="item-icon">📤</text>
            <text class="item-label">数据导出</text>
          </view>
          <text class="item-arrow">›</text>
        </view>
        
        <view class="settings-item" @click="viewPrivacy">
          <view class="item-left">
            <text class="item-icon">📜</text>
            <text class="item-label">隐私政策</text>
          </view>
          <text class="item-arrow">›</text>
        </view>
      </view>
    </view>

    <view class="settings-section">
      <view class="section-title">
        <text class="title-text">关于</text>
        <view class="title-line"></view>
      </view>
      
      <view class="settings-list glass-panel">
        <view class="settings-item">
          <view class="item-left">
            <text class="item-icon">ℹ️</text>
            <text class="item-label">版本</text>
          </view>
          <text class="item-value font-mono">v1.0.0</text>
        </view>
        
        <view class="settings-item" @click="checkUpdate">
          <view class="item-left">
            <text class="item-icon">🔄</text>
            <text class="item-label">检查更新</text>
          </view>
          <text class="item-arrow">›</text>
        </view>
        
        <view class="settings-item" @click="feedback">
          <view class="item-left">
            <text class="item-icon">💬</text>
            <text class="item-label">意见反馈</text>
          </view>
          <text class="item-arrow">›</text>
        </view>
      </view>
    </view>

    <view class="logout-btn glass-panel" v-if="userStore.isLoggedIn" @click="handleLogout">
      <text class="logout-text">退出登录</text>
    </view>

    <view class="footer-info">
      <text class="footer-text">永恒胶囊 · 守护你的数字记忆</text>
      <text class="footer-copyright">© 2024 Eterna Capsule</text>
    </view>

    <ProfileDrawer 
      v-model:visible="showProfileDrawer" 
      @close="closeProfileDrawer" 
    />

    <!-- 智脑配置弹窗 -->
    <view class="llm-drawer-overlay" :class="{ 'show': showLLMDrawer }" @click="closeLLMDrawer">
      <view class="llm-drawer glass-panel" :class="{ 'show': showLLMDrawer }" @click.stop>
        <view class="drawer-header">
          <text class="drawer-title">智脑配置</text>
          <view class="drawer-close" @click="closeLLMDrawer">
            <text class="close-icon">×</text>
          </view>
        </view>
        
        <view class="drawer-content">
          <view class="config-hint">
            <text class="hint-text">配置守护兽的 AI 模型，让它更懂你</text>
          </view>
          
          <view class="llm-input-item">
            <view class="llm-label">
              <text class="item-icon">🧠</text>
              <text class="item-label">模型名称</text>
            </view>
            <input 
              class="llm-input" 
              v-model="llmConfig.model"
              placeholder="如: glm-4-flash"
              placeholder-class="placeholder-text"
            />
          </view>
          
          <view class="llm-input-item">
            <view class="llm-label">
              <text class="item-icon">🌐</text>
              <text class="item-label">接口地址</text>
            </view>
            <input 
              class="llm-input" 
              v-model="llmConfig.baseUrl"
              placeholder="如: https://open.bigmodel.cn/api/paas/v4"
              placeholder-class="placeholder-text"
            />
          </view>
          
          <view class="llm-input-item">
            <view class="llm-label">
              <text class="item-icon">🔑</text>
              <text class="item-label">API Key</text>
              <text class="key-hint" v-if="llmConfig.apiKeyMasked">（已配置: {{ llmConfig.apiKeyMasked }}）</text>
            </view>
            <view class="api-key-wrapper">
              <input 
                class="llm-input api-key-input" 
                v-model="llmConfig.apiKey"
                :password="!showApiKey"
                :placeholder="llmConfig.apiKeyMasked ? '留空保持现有配置' : '输入你的 API Key'"
                placeholder-class="placeholder-text"
              />
              <view class="toggle-visibility" @click="showApiKey = !showApiKey">
                <text class="visibility-icon">{{ showApiKey ? '👁️' : '🙈' }}</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="drawer-footer">
          <view class="drawer-btn cancel-btn" @click="closeLLMDrawer">
            <text class="btn-text">取消</text>
          </view>
          <view class="drawer-btn save-btn" :class="{ 'saving': isSavingLLM }" @click="saveLLMConfig">
            <text class="btn-text">{{ isSavingLLM ? '保存中...' : '保存' }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useUserStore } from '@/stores/user'
import { userApi } from '@/api'
import ProfileDrawer from '@/components/ProfileDrawer.vue'

const userStore = useUserStore()

const biometricEnabled = ref(false)
const currentThreshold = ref('30天')
const thresholdOptions = ['3天', '7天', '14天', '30天', '60天', '90天']
const thresholdDaysMap: Record<string, number> = {
  '3天': 3,
  '7天': 7,
  '14天': 14,
  '30天': 30,
  '60天': 60,
  '90天': 90,
}
const showProfileDrawer = ref(false)

// LLM 配置弹窗
const showLLMDrawer = ref(false)
const llmConfig = reactive({
  model: '',
  baseUrl: '',
  apiKey: '',
  apiKeyMasked: '', // 脱敏后的显示值
})
const showApiKey = ref(false)
const isSavingLLM = ref(false)

onMounted(() => {
  userStore.init()
  if (userStore.isLoggedIn && userStore.heartbeatGraceDays) {
    const days = userStore.heartbeatGraceDays
    const found = Object.entries(thresholdDaysMap).find(([_, d]) => d === days)
    if (found) {
      currentThreshold.value = found[0]
    }
  }
})

const goToLogin = () => {
  uni.navigateTo({
    url: '/pages/login/login',
  })
}

const openProfileDrawer = () => {
  if (!userStore.isLoggedIn) {
    goToLogin()
    return
  }
  showProfileDrawer.value = true
}

const closeProfileDrawer = () => {
  showProfileDrawer.value = false
}

const changePassword = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

const toggleBiometric = (e: any) => {
  biometricEnabled.value = e.detail.value
  uni.showToast({ 
    title: biometricEnabled.value ? '已开启生物识别' : '已关闭生物识别', 
    icon: 'none' 
  })
}

const onThresholdChange = async (e: any) => {
  const selectedThreshold = thresholdOptions[e.detail.value]
  const days = thresholdDaysMap[selectedThreshold]
  
  if (!userStore.isLoggedIn) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  
  const result = await userStore.updateHeartbeatGraceDays(days)
  
  if (result.success) {
    currentThreshold.value = selectedThreshold
    uni.showToast({ 
      title: `已设置为${selectedThreshold}`, 
      icon: 'success' 
    })
  } else {
    uni.showToast({ 
      title: result.message || '设置失败', 
      icon: 'none' 
    })
  }
}

const manageKeys = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

const exportData = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

const viewPrivacy = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

const checkUpdate = () => {
  uni.showToast({ title: '已是最新版本', icon: 'none' })
}

const feedback = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

const handleLogout = () => {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.showToast({
          title: '已退出登录',
          icon: 'success',
        })
      }
    }
  })
}

// 打开 LLM 配置弹窗
const openLLMConfigDrawer = async () => {
  if (!userStore.isLoggedIn) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  
  // 加载当前配置
  try {
    const settings = await userApi.getSettings()
    llmConfig.model = settings.llmModel || ''
    llmConfig.baseUrl = settings.llmBaseUrl || ''
    llmConfig.apiKeyMasked = settings.llmApiKeyMasked || ''
    llmConfig.apiKey = ''
  } catch (error) {
    console.error('Failed to load LLM settings:', error)
  }
  
  showLLMDrawer.value = true
}

// 关闭 LLM 配置弹窗
const closeLLMDrawer = () => {
  showLLMDrawer.value = false
}

// 保存 LLM 配置
const saveLLMConfig = async () => {
  if (!llmConfig.model.trim() || !llmConfig.baseUrl.trim()) {
    uni.showToast({ title: '请填写模型名称和接口地址', icon: 'none' })
    return
  }
  
  isSavingLLM.value = true
  
  try {
    const updateData: { llmModel: string; llmBaseUrl: string; llmApiKey?: string } = {
      llmModel: llmConfig.model.trim(),
      llmBaseUrl: llmConfig.baseUrl.trim(),
    }
    
    // 只有输入了新的 API Key 才更新（空值不覆盖）
    if (llmConfig.apiKey.trim()) {
      updateData.llmApiKey = llmConfig.apiKey.trim()
    }
    
    await userApi.updateLLMConfig(updateData)
    
    // 关闭弹窗
    showLLMDrawer.value = false
    
    // 显示成功提示
    uni.showToast({ 
      title: '守护兽智脑已连接至星云', 
      icon: 'none',
      duration: 2000,
    })
  } catch (error) {
    console.error('Failed to save LLM config:', error)
    uni.showToast({ 
      title: '保存失败，请重试', 
      icon: 'none' 
    })
  } finally {
    isSavingLLM.value = false
  }
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: radial-gradient(ellipse at center, #1A1A1A 0%, #0A0A0A 100%);
  padding: 80rpx 32rpx 32rpx;
}

.page-header {
  text-align: center;
  margin-bottom: 48rpx;
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

.user-section {
  margin-bottom: 40rpx;
}

.user-card {
  display: flex;
  align-items: center;
  padding: 32rpx 24rpx;
  border-radius: 20rpx;
}

.user-avatar {
  position: relative;
  width: 100rpx;
  height: 100rpx;
  margin-right: 24rpx;
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
  font-size: 40rpx;
  color: #C1FF72;
  font-weight: 600;
}

.avatar-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  box-shadow: 0 0 20rpx rgba(193, 255, 114, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 32rpx;
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 8rpx;
  display: block;
}

.user-motto {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
  display: block;
}

.edit-arrow {
  font-size: 40rpx;
  color: rgba(255, 255, 255, 0.3);
}

.login-card {
  display: flex;
  align-items: center;
  padding: 32rpx 24rpx;
  border-radius: 20rpx;
}

.login-icon {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, rgba(193, 255, 114, 0.2) 0%, rgba(0, 242, 255, 0.2) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.icon-text {
  font-size: 36rpx;
}

.login-info {
  flex: 1;
}

.login-title {
  font-size: 30rpx;
  color: #ffffff;
  font-weight: 500;
  margin-bottom: 8rpx;
  display: block;
}

.login-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
  display: block;
}

.login-arrow {
  font-size: 40rpx;
  color: rgba(255, 255, 255, 0.3);
}

.settings-section {
  margin-bottom: 40rpx;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.title-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 2rpx;
}

.title-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
}

.settings-list {
  border-radius: 20rpx;
  overflow: hidden;
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.settings-item:last-child {
  border-bottom: none;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.item-icon {
  font-size: 28rpx;
}

.item-label {
  font-size: 28rpx;
  color: #ffffff;
}

.item-value {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.4);
}

.item-arrow {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.2);
}

.picker-value {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.value-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.6);
}

.logout-btn {
  margin-top: 40rpx;
  padding: 32rpx;
  text-align: center;
  border-radius: 20rpx;
}

.logout-text {
  font-size: 28rpx;
  color: #FF5C00;
}

.footer-info {
  text-align: center;
  margin-top: 60rpx;
  padding-bottom: 40rpx;
}

.footer-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.3);
  display: block;
}

.footer-copyright {
  font-size: 18rpx;
  color: rgba(255, 255, 255, 0.2);
  margin-top: 12rpx;
  display: block;
}

/* LLM 配置弹窗样式 */
.llm-drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.llm-drawer-overlay.show {
  opacity: 1;
  visibility: visible;
}

.llm-drawer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 85vh;
  border-radius: 32rpx 32rpx 0 0;
  background: rgba(20, 20, 20, 0.95);
  border: 1px solid rgba(193, 255, 114, 0.1);
  border-bottom: none;
  transform: translateY(100%);
  transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  flex-direction: column;
}

.llm-drawer.show {
  transform: translateY(0);
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 32rpx 24rpx;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.drawer-title {
  font-size: 34rpx;
  color: #C1FF72;
  font-weight: 600;
}

.drawer-close {
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

.drawer-content {
  flex: 1;
  padding: 32rpx;
  overflow-y: auto;
}

.config-hint {
  margin-bottom: 32rpx;
  padding: 20rpx 24rpx;
  background: rgba(193, 255, 114, 0.05);
  border-radius: 12rpx;
  border: 1px solid rgba(193, 255, 114, 0.1);
}

.hint-text {
  font-size: 24rpx;
  color: rgba(193, 255, 114, 0.8);
  line-height: 1.5;
}

.llm-input-item {
  margin-bottom: 28rpx;
}

.llm-label {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.key-hint {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.4);
  margin-left: 8rpx;
}

.llm-input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(193, 255, 114, 0.15);
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #C1FF72;
  box-sizing: border-box;
}

.llm-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.api-key-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.api-key-input {
  padding-right: 88rpx;
}

.toggle-visibility {
  position: absolute;
  right: 20rpx;
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
}

.visibility-icon {
  font-size: 24rpx;
}

.drawer-footer {
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.drawer-btn {
  flex: 1;
  padding: 28rpx;
  border-radius: 16rpx;
  text-align: center;
  transition: all 0.2s ease;
}

.drawer-btn:active {
  transform: scale(0.98);
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.cancel-btn .btn-text {
  color: rgba(255, 255, 255, 0.7);
}

.save-btn {
  background: linear-gradient(135deg, rgba(193, 255, 114, 0.2) 0%, rgba(0, 242, 255, 0.2) 100%);
  border: 1px solid rgba(193, 255, 114, 0.3);
}

.save-btn .btn-text {
  color: #C1FF72;
  font-weight: 500;
}

.save-btn.saving {
  opacity: 0.6;
  pointer-events: none;
}

.btn-text {
  font-size: 30rpx;
}
</style>
