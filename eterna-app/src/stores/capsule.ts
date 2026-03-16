import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { capsuleApi } from '@/api'
import type { Capsule, CreateCapsuleParams, UpdateCapsuleParams } from '@/api/types'
import { CryptoService, useCrypto } from '@/utils/crypto'

export const useCapsuleStore = defineStore('capsule', () => {
  const capsules = ref<Capsule[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const crypto = useCrypto()

  const totalCapsules = computed(() => capsules.value.length)
  const activeCapsules = computed(() => 
    capsules.value.filter(c => c.status === 'SEALED').length
  )
  const draftCapsules = computed(() => 
    capsules.value.filter(c => c.status === 'DRAFT').length
  )
  const encryptedCapsules = computed(() =>
    capsules.value.filter(c => c.encrypted).length
  )

  const fetchCapsules = async () => {
    loading.value = true
    error.value = null
    try {
      capsules.value = await capsuleApi.getAll()
    } catch (e: any) {
      error.value = e.message || '获取胶囊列表失败'
    } finally {
      loading.value = false
    }
  }

  const createCapsule = async (params: CreateCapsuleParams) => {
    loading.value = true
    error.value = null
    try {
      const newCapsule = await capsuleApi.create(params)
      capsules.value.unshift(newCapsule)
      return { success: true, data: newCapsule }
    } catch (e: any) {
      error.value = e.message || '创建胶囊失败'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const sealCapsule = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const updatedCapsule = await capsuleApi.seal(id)
      const index = capsules.value.findIndex(c => c.id === id)
      if (index > -1) {
        capsules.value[index] = updatedCapsule
      }
      return { success: true, data: updatedCapsule }
    } catch (e: any) {
      error.value = e.message || '封装胶囊失败'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateCapsule = async (id: string, params: UpdateCapsuleParams) => {
    loading.value = true
    error.value = null
    try {
      const updatedCapsule = await capsuleApi.update(id, params)
      const index = capsules.value.findIndex(c => c.id === id)
      if (index > -1) {
        capsules.value[index] = updatedCapsule
      }
      return { success: true, data: updatedCapsule }
    } catch (e: any) {
      error.value = e.message || '更新胶囊失败'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const deleteCapsule = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      await capsuleApi.delete(id)
      capsules.value = capsules.value.filter(c => c.id !== id)
      return { success: true }
    } catch (e: any) {
      error.value = e.message || '删除胶囊失败'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const recordHeartbeat = async (id: string) => {
    try {
      const updatedCapsule = await capsuleApi.heartbeat(id)
      const index = capsules.value.findIndex(c => c.id === id)
      if (index > -1) {
        capsules.value[index] = updatedCapsule
      }
      return { success: true }
    } catch (e: any) {
      return { success: false, message: e.message || '记录心跳失败' }
    }
  }

  const decryptCapsule = async (capsule: Capsule, password: string): Promise<string> => {
    if (!capsule.encrypted || !capsule.iv || !capsule.salt) {
      return capsule.content
    }

    try {
      const { key } = await crypto.deriveKey(password, capsule.salt)
      const decrypted = await crypto.decryptContent(capsule.content, capsule.iv, key)
      return decrypted
    } catch (e: any) {
      throw new Error('解密失败，请检查密码是否正确')
    }
  }

  const storeEncryptionKey = (userId: string, key: CryptoKey) => {
    CryptoService.storeKey(userId, key)
  }

  const getEncryptionKey = (userId: string): CryptoKey | undefined => {
    return CryptoService.getKey(userId)
  }

  const clearEncryptionKey = (userId: string) => {
    CryptoService.removeKey(userId)
  }

  return {
    capsules,
    loading,
    error,
    totalCapsules,
    activeCapsules,
    draftCapsules,
    encryptedCapsules,
    fetchCapsules,
    createCapsule,
    sealCapsule,
    updateCapsule,
    deleteCapsule,
    recordHeartbeat,
    decryptCapsule,
    storeEncryptionKey,
    getEncryptionKey,
    clearEncryptionKey,
  }
})
