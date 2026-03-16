import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSentinelStore = defineStore('sentinel', () => {
  const name = ref('毕方')
  const title = ref('数字守望者')
  const symbol = ref('🔥')
  const energy = ref(85)
  const symbiosisDays = ref(42)
  const conversationCount = ref(128)
  const capsulesCreated = ref(5)
  const lastActiveDays = ref(7)
  
  const currentMessage = computed(() => {
    if (energy.value > 70) {
      return '主人，今天也要元气满满哦！有什么想对我说的吗？'
    } else if (energy.value > 30) {
      return '主人，我有点累了...记得来和我互动呀~'
    } else {
      return '主人，我好想你...请多陪陪我吧...'
    }
  })

  const feed = () => {
    energy.value = Math.min(100, energy.value + 10)
  }

  const addConversation = () => {
    conversationCount.value++
    energy.value = Math.min(100, energy.value + 5)
  }

  const updateEnergy = (value: number) => {
    energy.value = Math.max(0, Math.min(100, value))
  }

  return {
    name,
    title,
    symbol,
    energy,
    symbiosisDays,
    conversationCount,
    capsulesCreated,
    lastActiveDays,
    currentMessage,
    feed,
    addConversation,
    updateEnergy
  }
})
