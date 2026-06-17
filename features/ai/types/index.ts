export type AIMode = 'normal' | 'curriculum'
export type AutonomyLevel = 'manual' | 'assisted' | 'autonomous'
export type MessageRole = 'user' | 'assistant'

export type ToolResultCard = {
  type: 'create_note' | 'create_task' | 'create_flashcard' | 'create_flashcard_set' | 'create_cluster'
  title: string
  subtitle?: string
  clusterName?: string
  clusterColor?: string
}

export type ChatAttachment = {
  url: string
  mediaType: string
}

export type Message = {
  id: string
  role: MessageRole
  content: string
  attachments?: ChatAttachment[]
  toolResults?: ToolResultCard[]
  questions?: {
    id: string
    question: string
    options: { label: string; value: string }[]
  }[]
  isStreaming?: boolean
  createdAt: Date
}

export type ChatState = {
  messages: Message[]
  isLoading: boolean
  autonomy: AutonomyLevel
  selectedClusterId: string | null
  selectedClusterName: string | null
  curriculumMode: boolean
  profile: Profile | null
}

export type Profile = {
  name: string
  study_stage: string
  subjects: string[]
  country: string
}
