import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, createWebSocket } from '../utils/api'
import type { FileInfo, CodeElement, Relation, StatusInfo, ActivityLog } from '../types'

export const useStore = defineStore('main', () => {
  const files = ref<FileInfo[]>([])
  const elements = ref<CodeElement[]>([])
  const relations = ref<Relation[]>([])
  const status = ref<StatusInfo>({
    watching: false,
    file_count: 0,
    element_count: 0,
    last_update: null,
    pending_files: 0
  })
  const activityLogs = ref<ActivityLog[]>([])
  const selectedFile = ref<FileInfo | null>(null)
  const selectedElement = ref<CodeElement | null>(null)
  const searchResults = ref<CodeElement[]>([])
  const searchQuery = ref('')
  const isLoading = ref(false)
  const ws = ref<WebSocket | null>(null)

  const recentFiles = computed(() => {
    return files.value.slice(0, 10)
  })

  const elementsByType = computed(() => {
    const grouped: Record<string, CodeElement[]> = {}
    elements.value.forEach(el => {
      if (!grouped[el.element_type]) {
        grouped[el.element_type] = []
      }
      grouped[el.element_type].push(el)
    })
    return grouped
  })

  async function fetchStatus() {
    try {
      status.value = await api.getStatus()
    } catch (e) {
      console.error('Failed to fetch status:', e)
    }
  }

  async function fetchFiles() {
    try {
      files.value = await api.getFiles()
    } catch (e) {
      console.error('Failed to fetch files:', e)
    }
  }

  async function fetchElements() {
    try {
      elements.value = await api.getAllElements()
    } catch (e) {
      console.error('Failed to fetch elements:', e)
    }
  }

  async function fetchRelations() {
    try {
      relations.value = await api.getAllRelations()
    } catch (e) {
      console.error('Failed to fetch relations:', e)
    }
  }

  async function fetchFileElements(fileId: number) {
    try {
      const data = await api.getFileElements(fileId)
      return data.elements
    } catch (e) {
      console.error('Failed to fetch file elements:', e)
      return []
    }
  }

  async function search(query: string, type?: string) {
    if (!query.trim()) {
      searchResults.value = []
      return
    }
    try {
      searchQuery.value = query
      searchResults.value = await api.search(query, type)
    } catch (e) {
      console.error('Failed to search:', e)
      searchResults.value = []
    }
  }

  async function startWatching(path: string) {
    try {
      isLoading.value = true
      await api.startWatch(path)
      await fetchStatus()
    } catch (e) {
      console.error('Failed to start watching:', e)
    } finally {
      isLoading.value = false
    }
  }

  async function stopWatching() {
    try {
      await api.stopWatch()
      await fetchStatus()
    } catch (e) {
      console.error('Failed to stop watching:', e)
    }
  }

  function addActivity(log: Omit<ActivityLog, 'id' | 'timestamp'>) {
    const newLog: ActivityLog = {
      ...log,
      id: Date.now(),
      timestamp: new Date()
    }
    activityLogs.value.unshift(newLog)
    if (activityLogs.value.length > 50) {
      activityLogs.value.pop()
    }
  }

  function connectWebSocket() {
    if (ws.value?.readyState === WebSocket.OPEN) return

    ws.value = createWebSocket()
    
    ws.value.onopen = () => {
      console.log('WebSocket connected')
    }

    ws.value.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'file_changed') {
          addActivity({ path: data.data.path, action: data.data.action })
          fetchStatus()
          fetchFiles()
        } else if (data.type === 'update_complete') {
          addActivity({
            path: data.data.path,
            action: 'updated',
            element_count: data.data.element_count,
            duration_ms: data.data.duration_ms
          })
          fetchElements()
          fetchRelations()
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e)
      }
    }

    ws.value.onclose = () => {
      console.log('WebSocket disconnected')
      ws.value = null
      setTimeout(connectWebSocket, 3000)
    }

    ws.value.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  function disconnectWebSocket() {
    if (ws.value) {
      ws.value.close()
      ws.value = null
    }
  }

  async function initialize() {
    isLoading.value = true
    try {
      await Promise.all([fetchStatus(), fetchFiles(), fetchElements(), fetchRelations()])
      connectWebSocket()
    } finally {
      isLoading.value = false
    }
  }

  return {
    files,
    elements,
    relations,
    status,
    activityLogs,
    selectedFile,
    selectedElement,
    searchResults,
    searchQuery,
    isLoading,
    recentFiles,
    elementsByType,
    fetchStatus,
    fetchFiles,
    fetchElements,
    fetchRelations,
    fetchFileElements,
    search,
    startWatching,
    stopWatching,
    addActivity,
    connectWebSocket,
    disconnectWebSocket,
    initialize
  }
})
