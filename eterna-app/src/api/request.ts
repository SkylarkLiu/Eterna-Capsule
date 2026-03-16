import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse } from './types'

const BASE_URL = 'http://localhost:3000/api'

const TOKEN_KEY = 'eterna_token'
const USER_KEY = 'eterna_user'

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY)
}

export const getStoredUser = (): any => {
  const user = localStorage.getItem(USER_KEY)
  return user ? JSON.parse(user) : null
}

export const setStoredUser = (user: any): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const removeStoredUser = (): void => {
  localStorage.removeItem(USER_KEY)
}

const instance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

instance.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error: AxiosError<ApiResponse>) => {
    if (error.response?.status === 401) {
      removeToken()
      removeStoredUser()
      
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        if (currentPath !== '/pages/login/login') {
          uni.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none',
          })
          setTimeout(() => {
            uni.redirectTo({
              url: '/pages/login/login',
            })
          }, 1500)
        }
      }
    }

    const errorMessage = error.response?.data?.message || '网络请求失败'
    const errors = error.response?.data?.errors

    return Promise.reject({
      message: errorMessage,
      errors,
      statusCode: error.response?.status,
    })
  }
)

export default instance
