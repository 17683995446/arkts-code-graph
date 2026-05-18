<script setup lang="ts">
import { onMounted } from 'vue'
import { useStore } from '../stores/main'
import StatusCard from '../components/StatusCard.vue'
import FileTree from '../components/FileTree.vue'
import GraphVisualization from '../components/GraphVisualization.vue'
import SearchBar from '../components/SearchBar.vue'
import ActivityLog from '../components/ActivityLog.vue'
import WatchControl from '../components/WatchControl.vue'

const store = useStore()

onMounted(() => {
  store.initialize()
})
</script>

<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <div class="logo">
        <div class="logo-icon">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="#00ff88" stroke-width="2"/>
            <circle cx="16" cy="10" r="3" fill="#00ff88"/>
            <circle cx="10" cy="20" r="3" fill="#0ea5e9"/>
            <circle cx="22" cy="20" r="3" fill="#f472b6"/>
            <line x1="16" y1="13" x2="10" y2="17" stroke="#64748b" stroke-width="1.5"/>
            <line x1="16" y1="13" x2="22" y2="17" stroke="#64748b" stroke-width="1.5"/>
            <line x1="13" y1="20" x2="19" y2="20" stroke="#64748b" stroke-width="1.5"/>
          </svg>
        </div>
        <div class="logo-text">
          <h1>ArkTS Knowledge Graph</h1>
          <p>Real-time Code Intelligence</p>
        </div>
      </div>
      <div class="header-badge">
        <span class="badge-dot"></span>
        <span>Incremental Updates</span>
      </div>
    </header>

    <main class="dashboard-main">
      <aside class="sidebar">
        <div class="sidebar-section">
          <StatusCard />
        </div>
        <div class="sidebar-section">
          <WatchControl />
        </div>
        <div class="sidebar-section file-tree-section">
          <FileTree />
        </div>
      </aside>

      <section class="main-content">
        <div class="content-header">
          <SearchBar />
        </div>
        <div class="content-graph">
          <GraphVisualization />
        </div>
      </section>

      <aside class="activity-sidebar">
        <ActivityLog />
      </aside>
    </main>

    <div v-if="store.isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #0a0a0f;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 32px;
  background: rgba(10, 10, 15, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.logo {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: rgba(0, 255, 136, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0, 255, 136, 0.2);
}

.logo-text h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #e2e8f0;
  letter-spacing: -0.5px;
}

.logo-text p {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.header-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(14, 165, 233, 0.1);
  border: 1px solid rgba(14, 165, 233, 0.3);
  border-radius: 20px;
  color: #0ea5e9;
  font-size: 12px;
  font-weight: 500;
}

.badge-dot {
  width: 6px;
  height: 6px;
  background: #0ea5e9;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.dashboard-main {
  flex: 1;
  display: grid;
  grid-template-columns: 300px 1fr 280px;
  gap: 24px;
  padding: 24px 32px;
  overflow: hidden;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.sidebar-section {
  flex-shrink: 0;
}

.file-tree-section {
  flex: 1;
  min-height: 300px;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
}

.content-header {
  flex-shrink: 0;
}

.content-graph {
  flex: 1;
  min-height: 0;
}

.activity-sidebar {
  overflow-y: auto;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 10, 15, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(0, 255, 136, 0.1);
  border-top-color: #00ff88;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 1200px) {
  .dashboard-main {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
  }

  .sidebar,
  .activity-sidebar {
    display: none;
  }
}
</style>
