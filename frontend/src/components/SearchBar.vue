<script setup lang="ts">
import { ref, watch } from 'vue'
import { useStore } from '../stores/main'
import { Search, X } from 'lucide-vue-next'

const store = useStore()
const searchInput = ref('')
const selectedType = ref('')
const isSearching = ref(false)

const elementTypes = [
  { value: '', label: 'All Types' },
  { value: 'function', label: 'Functions' },
  { value: 'class', label: 'Classes' },
  { value: 'interface', label: 'Interfaces' },
  { value: 'variable', label: 'Variables' }
]

let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(searchInput, (value) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    performSearch()
  }, 300)
})

watch(selectedType, () => {
  performSearch()
})

async function performSearch() {
  if (!searchInput.value.trim()) {
    store.searchResults = []
    return
  }
  
  isSearching.value = true
  await store.search(searchInput.value, selectedType.value || undefined)
  isSearching.value = false
}

function clearSearch() {
  searchInput.value = ''
  store.searchResults = []
}

function selectResult(element: any) {
  store.selectedElement = element
}
</script>

<template>
  <div class="search-bar">
    <div class="search-input-wrapper">
      <Search :size="18" class="search-icon" />
      <input
        v-model="searchInput"
        type="text"
        placeholder="Search functions, classes, interfaces..."
        class="search-input"
      />
      <button v-if="searchInput" @click="clearSearch" class="clear-btn">
        <X :size="16" />
      </button>
    </div>

    <select v-model="selectedType" class="type-select">
      <option v-for="type in elementTypes" :key="type.value" :value="type.value">
        {{ type.label }}
      </option>
    </select>

    <div v-if="store.searchResults.length > 0" class="search-results">
      <div
        v-for="result in store.searchResults"
        :key="result.id"
        class="result-item"
        @click="selectResult(result)"
      >
        <span class="result-type" :class="result.element_type">
          {{ result.element_type }}
        </span>
        <div class="result-info">
          <span class="result-name">{{ result.name }}</span>
          <span class="result-file">{{ result.file_path }}</span>
        </div>
      </div>
    </div>

    <div v-else-if="searchInput && !isSearching" class="no-results">
      No results found
    </div>
  </div>
</template>

<style scoped>
.search-bar {
  position: relative;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: #64748b;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 14px 44px;
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #e2e8f0;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.search-input::placeholder {
  color: #64748b;
}

.search-input:focus {
  border-color: #00ff88;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.1);
}

.clear-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.clear-btn:hover {
  color: #e2e8f0;
}

.type-select {
  margin-top: 12px;
  width: 100%;
  padding: 10px 14px;
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 13px;
  cursor: pointer;
  outline: none;
}

.type-select:focus {
  border-color: #00ff88;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background: rgba(15, 15, 25, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 100;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover {
  background: rgba(0, 255, 136, 0.05);
}

.result-type {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  min-width: 70px;
  text-align: center;
}

.result-type.function {
  background: rgba(0, 255, 136, 0.15);
  color: #00ff88;
}

.result-type.class {
  background: rgba(14, 165, 233, 0.15);
  color: #0ea5e9;
}

.result-type.interface {
  background: rgba(244, 114, 182, 0.15);
  color: #f472b6;
}

.result-type.variable {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #e2e8f0;
  font-family: 'JetBrains Mono', monospace;
}

.result-file {
  display: block;
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  padding: 20px;
  background: rgba(15, 15, 25, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
}
</style>
