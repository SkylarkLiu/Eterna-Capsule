import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Capsule {
  id: string
  name: string
  icon: string
  recipient: string
  trigger: string
  status: 'active' | 'pending' | 'delivered'
  createdAt: string
  content?: string
}

export const useCapsuleStore = defineStore('capsule', () => {
  const capsules = ref<Capsule[]>([
    {
      id: '1',
      name: '给未来的你',
      icon: '💌',
      recipient: '小明',
      trigger: '成年时 (18岁)',
      status: 'active',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: '家族传承',
      icon: '📜',
      recipient: '家人',
      trigger: '失联超过30天',
      status: 'active',
      createdAt: '2024-02-20'
    }
  ])

  const totalCapsules = computed(() => capsules.value.length)
  const activeCapsules = computed(() => 
    capsules.value.filter(c => c.status === 'active').length
  )

  const addCapsule = (capsule: Omit<Capsule, 'id' | 'createdAt'>) => {
    const newCapsule: Capsule = {
      ...capsule,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    }
    capsules.value.push(newCapsule)
  }

  const removeCapsule = (id: string) => {
    const index = capsules.value.findIndex(c => c.id === id)
    if (index > -1) {
      capsules.value.splice(index, 1)
    }
  }

  const updateCapsule = (id: string, updates: Partial<Capsule>) => {
    const capsule = capsules.value.find(c => c.id === id)
    if (capsule) {
      Object.assign(capsule, updates)
    }
  }

  return {
    capsules,
    totalCapsules,
    activeCapsules,
    addCapsule,
    removeCapsule,
    updateCapsule
  }
})
