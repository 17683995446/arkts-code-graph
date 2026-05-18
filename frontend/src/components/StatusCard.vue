<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '../stores/main'
import { Activity, FileCode, Layers, Clock } from 'lucide-vue-next'

const store = useStore()

const statusColor = computed(() => {
  return store.status.watching ? '#00ff88' : '#666'
})

const formattedLastUpdate = computed(() => {
  if (!store.status.last_update) return 'Never'
  const date = new Date(store.status.last_update)
  return date.toLocaleString()
})
</script>

<template>
  <div class="status-card">
    <div class="status-indicator" :style="{ backgroundColor: statusColor }">
      <Activity :size="20" />
      <span>{{ store.status.watching ? 'Monitoring' : 'Stopped' }}</span>
    </div>

    <div class="stats-grid">
      <div class="stat-item">
        <FileCode :size="24" class="stat-icon" />
        <div class="stat-content">
          <span class="stat-value">{{ store.status.file_count }}</span>
          <span class="stat-label">Files</span>
        </div>
      </div>

      <div class="stat-item">
        <Layers :size="24" class="stat-icon" />
        <div class="stat-content">
          <span class="stat-value">{{ store.status.element_count }}</span>
          <span class="stat-label">Elements</span>
        </div>
      </div>

      <div class="stat-item">
        <Clock :size="24" class="stat-icon" />
        <div class="stat-content">
          <span class="stat-value">{{ formattedLastUpdate }}</span>
          <span class="stat-label">Last Update</span>
        </div>
      </div>
    </div>

    <div v-if="store.status.pending_files > 0" class="pending-indicator">
      {{ store.status.pending_files }} files pending...
    </div>
  </div>
</template>

<style scoped>
.status-card {
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 30px;
  color: #0a0a0f;
  font-weight: 600;
  margin-bottom: 24px;
  width: fit-content;
  transition: all 0.3s ease;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-icon {
  color: #00ff88;
  opacity: 0.8;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #e2e8f0;
  font-family: 'JetBrains Mono', monospace;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pending-indicator {
  margin-top: 16px;
  padding: 10px 16px;
  background: rgba(14, 165, 233, 0.1);
  border: 1px solid rgba(14, 165, 233, 0.3);
  border-radius: 8px;
  color: #0ea5e9;
  font-size: 13px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
</style>
