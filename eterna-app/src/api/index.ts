import request from './request'
import type { AuthResponse, RegisterParams, LoginParams, UpdateUserParams, User, Capsule, CreateCapsuleParams, UpdateCapsuleParams } from './types'

export const authApi = {
  register: (data: RegisterParams): Promise<AuthResponse> => {
    return request.post('/auth/register', data)
  },

  login: (data: LoginParams): Promise<AuthResponse> => {
    return request.post('/auth/login', data)
  },
}

export const userApi = {
  getCurrentUser: (): Promise<User> => {
    return request.get('/users/me')
  },

  updateProfile: (data: UpdateUserParams): Promise<User> => {
    return request.patch('/users/update', data)
  },

  heartbeat: (): Promise<User> => {
    return request.post('/users/heartbeat')
  },

  updateHeartbeatGraceDays: (days: number): Promise<User> => {
    return request.patch('/users/update', { heartbeatGraceDays: days })
  },
}

export const capsuleApi = {
  create: (data: CreateCapsuleParams): Promise<Capsule> => {
    return request.post('/capsules', data)
  },

  getAll: (): Promise<Capsule[]> => {
    return request.get('/capsules')
  },

  getOne: (id: string): Promise<Capsule> => {
    return request.get(`/capsules/${id}`)
  },

  update: (id: string, data: UpdateCapsuleParams): Promise<Capsule> => {
    return request.patch(`/capsules/${id}`, data)
  },

  seal: (id: string): Promise<Capsule> => {
    return request.post(`/capsules/${id}/seal`)
  },

  delete: (id: string): Promise<void> => {
    return request.delete(`/capsules/${id}`)
  },

  heartbeat: (id: string): Promise<Capsule> => {
    return request.post(`/capsules/${id}/heartbeat`)
  },

  uploadMedia: (files: File[]): Promise<{ urls: string[] }> => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })
    return request.post('/capsules/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

export { request }
