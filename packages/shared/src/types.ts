export enum PermissionLevel {
  LEVEL_0_SAFE_READ = 0,
  LEVEL_1_SAFE_DEV = 1,
  LEVEL_2_USER_CONFIRMATION = 2,
  LEVEL_3_BLOCKED = 3,
}

export type PermissionDecision = 'ALLOW_ONCE' | 'ALLOW_FOR_PROJECT' | 'DENY';

export interface PermissionRequest {
  id: string;
  toolName: string;
  targetPath?: string;
  command?: string;
  reason: string;
  level: PermissionLevel;
  timestamp: string;
}

export interface PermissionResponse {
  requestId: string;
  decision: PermissionDecision;
  rememberChoice?: boolean;
}

export interface ToolCall {
  id: string;
  toolName: string;
  args: Record<string, any>;
  level: PermissionLevel;
  reason: string;
}

export interface ToolResult {
  callId: string;
  toolName: string;
  success: boolean;
  output?: any;
  error?: string;
  durationMs: number;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  action: string;
  toolName: string;
  target?: string;
  permissionLevel: PermissionLevel;
  permissionStatus: 'AUTOMATIC' | 'APPROVED' | 'DENIED' | 'BLOCKED';
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  details?: string;
}

export interface AgentTask {
  id: string;
  userPrompt: string;
  status: 'IDLE' | 'UNDERSTANDING' | 'PLANNING' | 'WAITING_PERMISSION' | 'EXECUTING' | 'VERIFYING' | 'COMPLETED' | 'FAILED' | 'DENIED';
  currentStep?: string;
  steps: {
    id: string;
    description: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'FAILED' | 'WARNING';
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface SystemHealth {
  status: 'OK' | 'DEGRADED' | 'ERROR';
  version: string;
  backendPort: number;
  approvedWorkspace: string;
  activeProject?: string;
  uptimeSeconds: number;
  toolsCount: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'jarvis' | 'system';
  content: string;
  timestamp: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  permissionRequest?: PermissionRequest;
  taskStatus?: AgentTask;
}

export type VoiceState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'ERROR';

export interface VoiceSettings {
  microphoneId: string;
  speakerId: string;
  voiceURI: string;
  speechSpeed: number;
  speechVolume: number;
  language: string;
  voiceEnabled: boolean;
  sttProvider: string;
  ttsProvider: string;
}

export interface AudioDevice {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput';
}

export interface VoiceLog {
  timestamp: string;
  event: string;
  details?: string;
  level: 'info' | 'warn' | 'error';
}

