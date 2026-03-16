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
  const personalityPrompt = ref('你是一个温和的向导，说话喜欢带星辰的隐喻。你是永恒的守护者，守护着主人的记忆。')
  const isSpeaking = ref(false)
  const totalConversations = ref(0)

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
    isSpeaking.value = true

    try {
      const response = await sentinelApi.chat(message)
      currentMessage.value = response.sentinelResponse

      chatHistory.value.push({
        id: `local-${Date.now()}`,
        role: 'user',
        content: response.userMessage,
        createdAt: new Date(response.timestamp).toISOString(),
      })

      chatHistory.value.push({
        id: `local-${Date.now() + 1}`,
        role: 'assistant',
        content: response.sentinelResponse,
        createdAt: new Date(response.timestamp + 100).toISOString(),
      })

      if (chatHistory.value.length > 100) {
        chatHistory.value = chatHistory.value.slice(-100)
      }

      return response.sentinelResponse
    } catch (error: any) {
      currentMessage.value = '星辰之间的连接似乎有些不稳定...'
      return currentMessage.value
    } finally {
      isLoading.value = false
      petState.value = 'IDLE'
      setTimeout(() => {
        isSpeaking.value = false
      }, 1000)
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

  async function fetchHistory(page: number = 1, limit: number = 50) {
    try {
      const response = await sentinelApi.getMessages(page, limit)
      chatHistory.value = response.messages.map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        createdAt: m.createdAt,
      }))
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

  function updatePersonality(newName: string, newPrompt: string) {
    name.value = newName
    personalityPrompt.value = newPrompt
  }

  async function fetchConfig() {
    try {
      const config = await sentinelApi.getConfig()
      name.value = config.customName
      personalityPrompt.value = config.personalityConfig
      energy.value = config.energy
      totalConversations.value = config.totalConversations
    } catch (error) {
      console.error('Failed to fetch sentinel config:', error)
    }
  }

  async function updateConfig(newName: string, newPrompt: string): Promise<boolean> {
    try {
      const result = await sentinelApi.updateConfig({
        customName: newName,
        personalityConfig: newPrompt,
      })
      
      if (result.success) {
        name.value = result.config.customName
        personalityPrompt.value = result.config.personalityConfig
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to update sentinel config:', error)
      return false
    }
  }

  const recentChats = computed(() => {
    return chatHistory.value.slice(0, 5)
  })

  const currentRoundMessages = computed(() => {
    if (chatHistory.value.length < 2) return chatHistory.value
    const latestAssistant = chatHistory.value.find(m => m.role === 'assistant')
    const latestUser = chatHistory.value.find(m => m.role === 'user')
    if (latestAssistant && latestUser) {
      return [latestUser, latestAssistant]
    }
    return chatHistory.value.slice(0, 2)
  })

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
    personalityPrompt,
    isSpeaking,
    totalConversations,
    energyLevel,
    petColor,
    recentChats,
    currentRoundMessages,
    chat,
    feed,
    fetchHistory,
    fetchMemories,
    setPetState,
    setEnergy,
    clearMessage,
    updatePersonality,
    fetchConfig,
    updateConfig,
  }
})
