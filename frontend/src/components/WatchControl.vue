<script setup lang="ts">
import { ref } from 'vue'
import { useStore } from '../stores/main'
import { FolderOpen, Play, Square } from 'lucide-vue-next'

const store = useStore()
const watchPath = ref('')

async function startWatch() {
  if (!watchPath.value.trim()) return
  await store.startWatching(watchPath.value)
}

async function stopWatch() {
  await store.stopWatching()
}
</script>

<template>
  <div class="watch-control">
    <div class="control-header">
      <h3>Monitor Control</h3>
    </div>

    <div class="control-content">
      <div v-if="!store.status.watching" class="start-section">
        <div class="path-input-wrapper">
          <FolderOpen :size="18" class="input-icon" />
          <input
            v-model="watchPath"
            type="text"
            placeholder="Enter project path to monitor..."
            class="path-input"
            @keyup.enter="startWatch"
          />
        </div>
        <button @click="startWatch" class="start-btn" :disabled="!watchPath.trim()">
          <Play :size="16" />
          Start Monitoring
        </button>
      </div>

      <div v-else class="watching-section">
        <div class="status-badge">
          <span class="pulse"></span>
          <span>Currently monitoring</span>
        </div>
        <p class="watch-path">{{ store.status.watching }}</p>
        <button @click="stopWatch" class="stop-btn">
          <Square :size="16" />
          Stop Monitoring
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.watch-control {
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.control-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.control-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.control-content {
  padding: 20px;
}

.path-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: #64748b;
  pointer-events: none;
}

.path-input {
  width: 100%;
  padding: 14px 14px 14px 44px;
  background: rgba(10, 10, 15, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #e2e8f0;
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
  outline: none;
  transition: all 0.3s ease;
}

.path-input::placeholder {
  color: #475569;
}

.path-input:focus {
  border-color: #00ff88;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.1);
}

.start-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
  border: none;
  border-radius: 10px;
  color: #0a0a0f;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 255, 136, 0.3);
}

.start-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.watching-section {
  text-align: center;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 30px;
  color: #00ff88;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 16px;
}

.pulse {
  width: 8px;
  height: 8px;
  background: #00ff88;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

.watch-path {
  font-size: 12px;
  color: #64748b;
  margin: 0 0 16px 0;
  font-family: 'JetBrains Mono', monospace;
  word-break: break-all;
}

.stop-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  background: transparent;
  border: 1px solid rgba(244, 114, 182, 0.5);
  border-radius: 10px;
  color: #f472b6;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.stop-btn:hover {
  background: rgba(244, 114, 182, 0.1);
  border-color: #f472b6;
}
</style>
