import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { sentinelApi } from '@/api'
import type { ChatMessage, UserMemory } from '@/api/types'

export type PetState = 'IDLE' | 'LISTENING' | 'HAPPY' | 'WEAK'

export const useSentinelStore = defineStore('sentinel', () => {
  const name = ref('Sentinel')
  const symbol = ref('◈')
  const energy = ref(100)
  const petState = ref<PetState>('IDLE')
  const currentMessage = ref('')
  const chatHistory = ref<ChatMessage[]>([])
  const memories = ref<UserMemory[]>([])
  const isLoading = ref(false)
  const isFeeding = ref(false)

  const energyLevel = computed(() => {
    if (energy.value > 70) return 'high'
    if (energy.value > 30) return 'medium'
    return 'low'
  })

  const petColor = computed(() => {
    if (energy.value > 70) return { primary: '#C1FF72', secondary: '#00F2FF' }
    if (energy.value > 30) return { primary: '#00F2FF', secondary: '#FFD700' }
    return { primary: '#FF5C00', secondary: '#FF8C00' }
  })

  async function chat(message: string): Promise<string> {
    isLoading.value = true
    petState.value = 'LISTENING'

    try {
      const response = await sentinelApi.chat(message)
      currentMessage.value = response.response

      chatHistory.value.unshift({
        role: 'user',
        content: message,
        createdAt: new Date().toISOString(),
      })

      chatHistory.value.unshift({
        role: 'assistant',
        content: response.response,
        createdAt: new Date().toISOString(),
      })

      if (chatHistory.value.length > 20) {
        chatHistory.value = chatHistory.value.slice(0, 20)
      }

      return response.response
    } catch (error: any) {
      currentMessage.value = '星辰之间的连接似乎有些不稳定...'
      return currentMessage.value
    } finally {
      isLoading.value = false
      petState.value = 'IDLE'
    }
  }

  async function feed(): Promise<number> {
    isFeeding.value = true
    petState.value = 'HAPPY'

    try {
      const response = await sentinelApi.feed()
      energy.value = Math.min(100, energy.value + response.energyIncrease)
      currentMessage.value = response.message

      setTimeout(() => {
        isFeeding.value = false
        petState.value = 'IDLE'
      }, 2000)

      return response.energyIncrease
    } catch (error: any) {
      isFeeding.value = false
      petState.value = 'IDLE'
      return 0
    }
  }

  async function fetchHistory(limit: number = 10) {
    try {
      const response = await sentinelApi.getHistory(limit)
      chatHistory.value = response.history
    } catch (error) {
      console.error('Failed to fetch chat history:', error)
    }
  }

  async function fetchMemories(limit: number = 10) {
    try {
      const response = await sentinelApi.getMemories(limit)
      memories.value = response.memories
    } catch (error) {
      console.error('Failed to fetch memories:', error)
    }
  }

  function setPetState(state: PetState) {
    petState.value = state
  }

  function setEnergy(value: number) {
    energy.value = Math.max(0, Math.min(100, value))
  }

  function clearMessage() {
    currentMessage.value = ''
  }

  return {
    name,
    symbol,
    energy,
    petState,
    currentMessage,
    chatHistory,
    memories,
    isLoading,
    isFeeding,
    energyLevel,
    petColor,
    chat,
    feed,
    fetchHistory,
    fetchMemories,
    setPetState,
    setEnergy,
    clearMessage,
  }
})
