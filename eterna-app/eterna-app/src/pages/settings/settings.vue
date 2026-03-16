<template>
  <view class="settings-page">
    <view class="page-header">
      <text class="page-title font-mono">设置</text>
      <text class="page-subtitle">SETTINGS</text>
    </view>

    <view class="settings-section">
      <view class="section-title">
        <text class="title-text">账户</text>
        <view class="title-line"></view>
      </view>
      
      <view class="settings-list glass-panel">
        <view class="settings-item" @click="editProfile">
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

    <view class="logout-btn glass-panel" @click="logout">
      <text class="logout-text">退出登录</text>
    </view>

    <view class="footer-info">
      <text class="footer-text">永恒胶囊 · 守护你的数字记忆</text>
      <text class="footer-copyright">© 2024 Eterna Capsule</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const biometricEnabled = ref(false)
const currentThreshold = ref('30天')
const thresholdOptions = ['7天', '14天', '30天', '60天', '90天']

const editProfile = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' })
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

const onThresholdChange = (e: any) => {
  currentThreshold.value = thresholdOptions[e.detail.value]
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

const logout = () => {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.reLaunch({ url: '/pages/index/index' })
      }
    }
  })
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
</style>
