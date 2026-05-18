const API_BASE = 'http://localhost:8000/api'

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  return response.json()
}

export const api = {
  async getStatus() {
    return fetchJson<{
      watching: boolean
      file_count: number
      element_count: number
      last_update: string | null
      pending_files: number
    }>(`${API_BASE}/status`)
  },

  async getFiles() {
    const data = await fetchJson<{ files: any[] }>(`${API_BASE}/files`)
    return data.files
  },

  async getFileElements(fileId: number) {
    return fetchJson<{ file: any; elements: any[] }>(`${API_BASE}/files/${fileId}/elements`)
  },

  async getAllElements() {
    const data = await fetchJson<{ elements: any[] }>(`${API_BASE}/elements`)
    return data.elements
  },

  async getAllRelations() {
    const data = await fetchJson<{ relations: any[] }>(`${API_BASE}/relations`)
    return data.relations
  },

  async search(query: string, type?: string) {
    const params = new URLSearchParams({ q: query })
    if (type) params.append('type', type)
    const data = await fetchJson<{ results: any[] }>(`${API_BASE}/search?${params}`)
    return data.results
  },

  async getElement(elementId: number) {
    return fetchJson<any>(`${API_BASE}/elements/${elementId}`)
  },

  async startWatch(path: string) {
    return fetchJson<{ status: string; path: string }>(`${API_BASE}/watch/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path })
    })
  },

  async stopWatch() {
    return fetchJson<{ status: string }>(`${API_BASE}/watch/stop`, { method: 'POST' })
  },

  async getWatchStatus() {
    return fetchJson<any>(`${API_BASE}/watch/status`)
  },

  async updateFile(filePath: string) {
    return fetchJson<{ status: string; path: string }>(`${API_BASE}/update/${encodeURIComponent(filePath)}`, {
      method: 'POST'
    })
  }
}

export function createWebSocket(): WebSocket {
  const ws = new WebSocket('ws://localhost:8000/api/ws')
  return ws
}
