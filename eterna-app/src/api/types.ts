export interface User {
  id: string
  email: string | null
  phone: string | null
  username: string
  avatarUrl: string | null
  motto: string | null
  lastHeartbeatAt: string | null
  heartbeatStatus: HeartbeatStatus
  heartbeatGraceDays: number
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
}

export type HeartbeatStatus = 'ALIVE' | 'MISSING' | 'DEPARTED'

export interface AuthResponse {
  accessToken: string
  user: User
}

export interface RegisterParams {
  email?: string
  phone?: string
  password: string
  username: string
}

export interface LoginParams {
  account: string
  password: string
}

export interface UpdateUserParams {
  username?: string
  email?: string
  phone?: string
  avatarUrl?: string
  motto?: string
  heartbeatGraceDays?: number
}

export type CapsuleType = 'TEXT' | 'IMAGE' | 'VIDEO'
export type CapsuleStatus = 'DRAFT' | 'SEALED' | 'SENT'
export type TriggerType = 'TIME' | 'INACTIVITY'
export type ContactMethod = 'EMAIL' | 'PHONE' | 'QQ' | 'WECHAT'

export interface Capsule {
  id: string
  title: string
  content: string
  mediaUrls: string[]
  type: CapsuleType
  status: CapsuleStatus
  triggerType: TriggerType
  triggerDate: string | null
  graceDays: number | null
  lastHeartbeat: string | null
  sentAt: string | null
  recipientName: string | null
  contactMethod: ContactMethod | null
  contactValue: string | null
  encrypted: boolean
  iv: string | null
  salt: string | null
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateCapsuleParams {
  title: string
  content: string
  mediaUrls?: string[]
  type: CapsuleType
  triggerType: TriggerType
  triggerDate?: string
  graceDays?: number
  recipientName?: string
  contactMethod?: ContactMethod
  contactValue?: string
  encrypted?: boolean
  iv?: string
  salt?: string
}

export interface UpdateCapsuleParams {
  title?: string
  content?: string
  mediaUrls?: string[]
  type?: CapsuleType
  triggerType?: TriggerType
  triggerDate?: string
  graceDays?: number
  recipientName?: string
  contactMethod?: ContactMethod
  contactValue?: string
}

export interface ApiResponse<T = any> {
  statusCode: number
  message: string
  data?: T
  errors?: string[]
}

export interface ChatMessage {
  id?: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface ChatResponse {
  userMessage: string
  sentinelResponse: string
  timestamp: number
}

export interface FeedResponse {
  message: string
  energyIncrease: number
}

export interface UserMemory {
  summary: string
  tags: string[]
  importanceScore: number
  createdAt: string
}

export interface SentinelConfig {
  customName: string
  personalityConfig: string
  energy: number
  totalConversations: number
}

export interface UpdateSentinelConfigParams {
  customName?: string
  personalityConfig?: string
}

export interface MessagesResponse {
  messages: ChatMessage[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface SearchMessagesResponse {
  messages: Array<{
    id: string
    role: string
    content: string
    createdAt: string
    context?: string
  }>
  total: number
}

export interface ChatHistoryResponse {
  history: ChatMessage[]
}

export interface MemoriesResponse {
  memories: UserMemory[]
}
