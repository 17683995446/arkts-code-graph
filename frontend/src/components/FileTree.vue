<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from '../stores/main'
import { FileCode, ChevronRight, ChevronDown, Folder } from 'lucide-vue-next'
import type { FileInfo } from '../types'

const store = useStore()
const expandedFolders = ref<Set<string>>(new Set())

const groupedFiles = computed(() => {
  const groups: Record<string, FileInfo[]> = {}
  
  store.files.forEach(file => {
    const parts = file.path.split('/')
    const folder = parts.length > 2 ? parts[parts.length - 2] : 'root'
    
    if (!groups[folder]) {
      groups[folder] = []
    }
    groups[folder].push(file)
  })
  
  return groups
})

function toggleFolder(folder: string) {
  if (expandedFolders.value.has(folder)) {
    expandedFolders.value.delete(folder)
  } else {
    expandedFolders.value.add(folder)
  }
}

function selectFile(file: FileInfo) {
  store.selectedFile = file
}

function getFileName(path: string): string {
  return path.split('/').pop() || path
}

function getFileIcon(type: string) {
  return FileCode
}
</script>

<template>
  <div class="file-tree">
    <div class="tree-header">
      <h3>Project Files</h3>
      <span class="file-count">{{ store.files.length }}</span>
    </div>

    <div class="tree-content">
      <div v-if="store.files.length === 0" class="empty-state">
        <Folder :size="40" />
        <p>No files tracked yet</p>
        <p class="hint">Start monitoring to begin</p>
      </div>

      <div v-for="(files, folder) in groupedFiles" :key="folder" class="folder-group">
        <div class="folder-header" @click="toggleFolder(folder)">
          <component 
            :is="expandedFolders.has(folder) ? ChevronDown : ChevronRight" 
            :size="16" 
          />
          <Folder :size="16" />
          <span class="folder-name">{{ folder }}</span>
          <span class="folder-count">{{ files.length }}</span>
        </div>

        <div v-if="expandedFolders.has(folder)" class="folder-files">
          <div
            v-for="file in files"
            :key="file.id"
            class="file-item"
            :class="{ active: store.selectedFile?.id === file.id }"
            @click="selectFile(file)"
          >
            <component :is="getFileIcon(file.path)" :size="14" />
            <span class="file-name">{{ getFileName(file.path) }}</span>
            <span class="element-count">{{ file.element_count || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.file-tree {
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tree-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tree-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.file-count {
  background: rgba(0, 255, 136, 0.1);
  color: #00ff88;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.tree-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #64748b;
  text-align: center;
}

.empty-state svg {
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.empty-state .hint {
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.7;
}

.folder-group {
  margin-bottom: 8px;
}

.folder-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  color: #94a3b8;
}

.folder-header:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #e2e8f0;
}

.folder-name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
}

.folder-count {
  font-size: 11px;
  color: #64748b;
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 8px;
  border-radius: 10px;
}

.folder-files {
  margin-left: 20px;
  margin-top: 4px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  margin: 2px 0;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  color: #94a3b8;
  font-size: 13px;
}

.file-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #e2e8f0;
}

.file-item.active {
  background: rgba(0, 255, 136, 0.1);
  color: #00ff88;
  border-left: 2px solid #00ff88;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.element-count {
  font-size: 11px;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 8px;
}

.file-item.active .element-count {
  background: rgba(0, 255, 136, 0.2);
}
</style>
