export interface FileInfo {
  id: number
  path: string
  hash: string
  modified: string
  element_count?: number
}

export interface CodeElement {
  id: number
  file_id: number
  name: string
  element_type: 'function' | 'class' | 'interface' | 'variable' | 'decorator'
  code: string
  line_start: number
  line_end: number
  metadata: string
  file_path?: string
}

export interface Relation {
  id: number
  from_element: number
  to_element: number
  relation_type: 'calls' | 'imports' | 'extends' | 'implements' | 'uses'
  from_name?: string
  to_name?: string
  from_type?: string
  to_type?: string
}

export interface GraphNode {
  id: string
  name: string
  type: string
  file_path?: string
  line_start?: number
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

export interface GraphLink {
  source: string
  target: string
  type: string
}

export interface StatusInfo {
  watching: boolean
  file_count: number
  element_count: number
  last_update: string | null
  pending_files: number
}

export interface ActivityLog {
  id: number
  path: string
  action: string
  element_count?: number
  duration_ms?: number
  timestamp: Date
}
