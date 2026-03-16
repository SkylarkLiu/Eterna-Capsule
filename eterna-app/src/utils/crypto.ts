const SALT_LENGTH = 16
const IV_LENGTH = 12
const KEY_LENGTH = 256

export interface EncryptionResult {
  ciphertext: string
  iv: string
  salt: string
}

export interface DerivedKey {
  key: CryptoKey
  salt: string
}

export class CryptoService {
  private static keyStore: Map<string, CryptoKey> = new Map()

  static async generateSalt(): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
    return this.arrayBufferToBase64(salt.buffer)
  }

  static async deriveKey(password: string, saltBase64?: string): Promise<DerivedKey> {
    const salt = saltBase64 
      ? this.base64ToArrayBuffer(saltBase64) 
      : crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
    
    const encoder = new TextEncoder()
    const passwordBuffer = encoder.encode(password)
    
    const baseKey = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    )
    
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      baseKey,
      { name: 'AES-GCM', length: KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    )
    
    const saltBase64Result = this.arrayBufferToBase64(salt.buffer)
    
    return {
      key: derivedKey,
      salt: saltBase64Result,
    }
  }

  static async encryptContent(content: string, key: CryptoKey): Promise<EncryptionResult> {
    const encoder = new TextEncoder()
    const contentBuffer = encoder.encode(content)
    
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
    
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128,
      },
      key,
      contentBuffer
    )
    
    return {
      ciphertext: this.arrayBufferToBase64(encryptedBuffer),
      iv: this.arrayBufferToBase64(iv.buffer),
      salt: '',
    }
  }

  static async decryptContent(
    ciphertext: string,
    iv: string,
    key: CryptoKey
  ): Promise<string> {
    const ciphertextBuffer = this.base64ToArrayBuffer(ciphertext)
    const ivBuffer = this.base64ToArrayBuffer(iv)
    
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBuffer,
        tagLength: 128,
      },
      key,
      ciphertextBuffer
    )
    
    const decoder = new TextDecoder()
    return decoder.decode(decryptedBuffer)
  }

  static async encryptFile(file: File, key: CryptoKey): Promise<EncryptionResult> {
    const fileBuffer = await file.arrayBuffer()
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
    
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128,
      },
      key,
      fileBuffer
    )
    
    return {
      ciphertext: this.arrayBufferToBase64(encryptedBuffer),
      iv: this.arrayBufferToBase64(iv.buffer),
      salt: '',
    }
  }

  static async encryptFileInChunks(
    file: File,
    key: CryptoKey,
    chunkSize: number = 1024 * 1024,
    onProgress?: (progress: number) => void
  ): Promise<{ chunks: EncryptionResult[]; totalSize: number }> {
    const chunks: EncryptionResult[] = []
    const totalChunks = Math.ceil(file.size / chunkSize)
    
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)
      
      const encryptedChunk = await this.encryptFile(chunk as File, key)
      chunks.push(encryptedChunk)
      
      if (onProgress) {
        onProgress((i + 1) / totalChunks * 100)
      }
    }
    
    return {
      chunks,
      totalSize: file.size,
    }
  }

  static storeKey(userId: string, key: CryptoKey): void {
    this.keyStore.set(userId, key)
  }

  static getKey(userId: string): CryptoKey | undefined {
    return this.keyStore.get(userId)
  }

  static removeKey(userId: string): void {
    this.keyStore.delete(userId)
  }

  static clearAllKeys(): void {
    this.keyStore.clear()
  }

  static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }

  static async generateRandomKey(): Promise<string> {
    const key = crypto.getRandomValues(new Uint8Array(32))
    return this.arrayBufferToBase64(key.buffer)
  }

  static async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    return this.arrayBufferToBase64(hashBuffer)
  }
}

export function useCrypto() {
  return {
    deriveKey: CryptoService.deriveKey,
    encryptContent: CryptoService.encryptContent,
    decryptContent: CryptoService.decryptContent,
    encryptFile: CryptoService.encryptFile,
    encryptFileInChunks: CryptoService.encryptFileInChunks,
    storeKey: CryptoService.storeKey,
    getKey: CryptoService.getKey,
    removeKey: CryptoService.removeKey,
    clearAllKeys: CryptoService.clearAllKeys,
    generateSalt: CryptoService.generateSalt,
    generateRandomKey: CryptoService.generateRandomKey,
    hashPassword: CryptoService.hashPassword,
  }
}
