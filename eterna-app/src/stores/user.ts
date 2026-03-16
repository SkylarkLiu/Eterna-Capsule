import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, userApi } from '@/api'
import { setToken, getToken, removeToken, getStoredUser, setStoredUser, removeStoredUser } from '@/api/request'
import type { User, RegisterParams, LoginParams, UpdateUserParams } from '@/api/types'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const lastHeartbeatTime = ref<Date | null>(null)

  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const username = computed(() => user.value?.username || '未登录')
  const avatarUrl = computed(() => user.value?.avatarUrl || '')
  const motto = computed(() => user.value?.motto || '')
  
  const heartbeatStatus = computed(() => user.value?.heartbeatStatus || 'ALIVE')
  const heartbeatGraceDays = computed(() => user.value?.heartbeatGraceDays || 30)
  const lastHeartbeatAt = computed(() => user.value?.lastHeartbeatAt ? new Date(user.value.lastHeartbeatAt) : null)

  function init() {
    const storedToken = getToken()
    const storedUser = getStoredUser()
    
    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = storedUser
    }
  }

  async function register(params: RegisterParams) {
    loading.value = true
    try {
      const response = await authApi.register(params)
      token.value = response.accessToken
      user.value = response.user
      setToken(response.accessToken)
      setStoredUser(response.user)
      return { success: true, data: response }
    } catch (error: any) {
      return { success: false, message: error.message || '注册失败', errors: error.errors }
    } finally {
      loading.value = false
    }
  }

  async function login(params: LoginParams) {
    loading.value = true
    try {
      const response = await authApi.login(params)
      token.value = response.accessToken
      user.value = response.user
      setToken(response.accessToken)
      setStoredUser(response.user)
      return { success: true, data: response }
    } catch (error: any) {
      return { success: false, message: error.message || '登录失败', errors: error.errors }
    } finally {
      loading.value = false
    }
  }

  function logout() {
    token.value = null
    user.value = null
    removeToken()
    removeStoredUser()
  }

  async function fetchCurrentUser() {
    if (!token.value) return null
    
    loading.value = true
    try {
      const userData = await userApi.getCurrentUser()
      user.value = userData
      setStoredUser(userData)
      return userData
    } catch (error: any) {
      if (error.statusCode === 401) {
        logout()
      }
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(params: UpdateUserParams) {
    if (!user.value) return { success: false, message: '用户未登录' }
    
    loading.value = true
    try {
      const updatedUser = await userApi.updateProfile(params)
      user.value = updatedUser
      setStoredUser(updatedUser)
      return { success: true, data: updatedUser }
    } catch (error: any) {
      return { success: false, message: error.message || '更新失败', errors: error.errors }
    } finally {
      loading.value = false
    }
  }

  async function sendHeartbeat() {
    if (!user.value || !token.value) return { success: false }
    
    try {
      const updatedUser = await userApi.heartbeat()
      user.value = updatedUser
      lastHeartbeatTime.value = new Date()
      setStoredUser(updatedUser)
      return { success: true }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  }

  async function updateHeartbeatGraceDays(days: number) {
    return updateProfile({ heartbeatGraceDays: days })
  }

  function getTimeUntilTrigger(): { hours: number; minutes: number; totalMinutes: number } | null {
    if (!lastHeartbeatAt.value || !heartbeatGraceDays.value) return null
    
    const graceMs = heartbeatGraceDays.value * 24 * 60 * 60 * 1000
    const triggerTime = new Date(lastHeartbeatAt.value.getTime() + graceMs)
    const now = new Date()
    const diff = triggerTime.getTime() - now.getTime()
    
    if (diff <= 0) {
      return { hours: 0, minutes: 0, totalMinutes: 0 }
    }
    
    const totalMinutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    
    return { hours, minutes, totalMinutes }
  }

  function getHeartbeatHealthStatus(): 'healthy' | 'warning' | 'critical' {
    if (!lastHeartbeatAt.value) return 'healthy'
    
    const now = new Date()
    const hoursSinceLastHeartbeat = (now.getTime() - lastHeartbeatAt.value.getTime()) / (1000 * 60 * 60)
    
    if (hoursSinceLastHeartbeat < 24) return 'healthy'
    if (hoursSinceLastHeartbeat < 48) return 'warning'
    return 'critical'
  }

  return {
    user,
    token,
    loading,
    lastHeartbeatTime,
    isLoggedIn,
    username,
    avatarUrl,
    motto,
    heartbeatStatus,
    heartbeatGraceDays,
    lastHeartbeatAt,
    init,
    register,
    login,
    logout,
    fetchCurrentUser,
    updateProfile,
    sendHeartbeat,
    updateHeartbeatGraceDays,
    getTimeUntilTrigger,
    getHeartbeatHealthStatus,
  }
})
