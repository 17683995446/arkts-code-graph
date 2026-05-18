<script setup lang="ts">
import { useStore } from '../stores/main'
import { Activity, FileCode, CheckCircle, Clock } from 'lucide-vue-next'

const store = useStore()

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: false 
  })
}

function getActionIcon(action: string) {
  switch (action) {
    case 'updated': return CheckCircle
    case 'created': return FileCode
    default: return Activity
  }
}

function getActionColor(action: string) {
  switch (action) {
    case 'updated': return '#00ff88'
    case 'created': return '#0ea5e9'
    case 'deleted': return '#f472b6'
    default: return '#fbbf24'
  }
}

function getFileName(path: string): string {
  return path.split('/').pop() || path
}
</script>

<template>
  <div class="activity-log">
    <div class="log-header">
      <h3>Recent Activity</h3>
      <Activity :size="16" />
    </div>

    <div class="log-content">
      <div v-if="store.activityLogs.length === 0" class="empty-state">
        <Clock :size="32" />
        <p>No recent activity</p>
      </div>

      <TransitionGroup name="list" tag="div" class="log-list">
        <div
          v-for="log in store.activityLogs"
          :key="log.id"
          class="log-item"
        >
          <div class="log-icon" :style="{ color: getActionColor(log.action) }">
            <component :is="getActionIcon(log.action)" :size="14" />
          </div>
          <div class="log-details">
            <span class="log-action">{{ log.action }}</span>
            <span class="log-file">{{ getFileName(log.path) }}</span>
            <div v-if="log.duration_ms" class="log-meta">
              <span>{{ log.element_count }} elements</span>
              <span>{{ log.duration_ms }}ms</span>
            </div>
          </div>
          <span class="log-time">{{ formatTime(log.timestamp) }}</span>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.activity-log {
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.log-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.log-content {
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
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 13px;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.log-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.log-icon {
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.log-details {
  flex: 1;
  min-width: 0;
}

.log-action {
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.log-file {
  display: block;
  font-size: 13px;
  color: #e2e8f0;
  font-family: 'JetBrains Mono', monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-meta {
  display: flex;
  gap: 12px;
  margin-top: 6px;
  font-size: 11px;
  color: #64748b;
}

.log-time {
  font-size: 11px;
  color: #64748b;
  font-family: 'JetBrains Mono', monospace;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
