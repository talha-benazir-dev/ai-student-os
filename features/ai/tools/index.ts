export const nucleusTools = [
  {
    name: 'get_clusters',
    description: 'Fetches all clusters for the current user. Always call this first before creating any content that needs a cluster_id.',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_notes',
    description: 'Fetches notes for the current user.',
    input_schema: {
      type: 'object',
      properties: {
        cluster_id: { type: 'string', description: 'Filter by cluster UUID. Omit for all notes.' }
      },
      required: []
    }
  },
  {
    name: 'get_tasks',
    description: 'Fetches tasks for the current user.',
    input_schema: {
      type: 'object',
      properties: {
        cluster_id: { type: 'string', description: 'Filter by cluster UUID. Omit for all tasks.' }
      },
      required: []
    }
  },
  {
    name: 'get_flashcards',
    description: 'Fetches flashcards for the current user.',
    input_schema: {
      type: 'object',
      properties: {
        cluster_id: { type: 'string', description: 'Filter by cluster UUID. Omit for all flashcards.' }
      },
      required: []
    }
  },
  {
    name: 'create_cluster',
    description: 'Creates a new cluster. Use when the user wants to organize content under a new topic or subject.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Cluster name' },
        color: {
          type: 'string',
          description: 'Hex color for the cluster',
          enum: ['#7c5cfc', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']
        }
      },
      required: ['name', 'color']
    }
  },
  {
    name: 'create_note',
    description: 'Creates a new note. Use for summaries, explanations, study notes, and any written content.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        content: { type: 'string', description: 'Note body. Use markdown for readme type.' },
        type: { type: 'string', enum: ['text', 'readme'], description: 'Use readme for structured markdown content, text for simple notes.' },
        cluster_id: { type: 'string', description: 'UUID of cluster. Omit for General.' }
      },
      required: ['title', 'content', 'type']
    }
  },
  {
    name: 'create_task',
    description: 'Creates a new task.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'] },
        due_date: { type: 'string', description: 'ISO date YYYY-MM-DD. Omit if not mentioned.' },
        reward: { type: 'string', description: 'Optional reward for completing this task.' },
        importance_points: { type: 'number', description: 'Integer 1-100. Default 10.' },
        cluster_id: { type: 'string', description: 'UUID of cluster. Omit for General.' }
      },
      required: ['title', 'priority', 'importance_points']
    }
  },
  {
    name: 'create_flashcard',
    description: 'Creates a single flashcard. Only use for one card — use create_flashcard_set for 2 or more.',
    input_schema: {
      type: 'object',
      properties: {
        front: { type: 'string', description: 'Question or prompt' },
        back: { type: 'string', description: 'Answer or explanation' },
        difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
        cluster_id: { type: 'string', description: 'UUID of cluster. Omit for General.' }
      },
      required: ['front', 'back', 'difficulty']
    }
  },
  {
    name: 'create_flashcard_set',
    description: 'Creates multiple flashcards at once. Always use this when generating 2 or more flashcards.',
    input_schema: {
      type: 'object',
      properties: {
        cards: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              front: { type: 'string' },
              back: { type: 'string' },
              difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] }
            },
            required: ['front', 'back', 'difficulty']
          }
        },
        cluster_id: { type: 'string', description: 'UUID of cluster. Omit for General.' }
      },
      required: ['cards']
    }
  },
  {
    name: 'create_chart_note',
    description: 'Create a chart note from a natural language description. Use when the user wants to visualize data as a chart.',
    input_schema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'What the chart should show' },
        chartType: { type: 'string', enum: ['bar', 'line', 'pie', 'area'] },
        title: { type: 'string' },
        cluster_id: { type: 'string', description: 'Optional cluster ID' }
      },
      required: ['prompt', 'chartType', 'title']
    }
  },
  {
    name: 'create_diagram_note',
    description: 'Create a diagram note from a natural language description. Use when the user wants a flowchart or mind map.',
    input_schema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'What the diagram should show' },
        diagramType: { type: 'string', enum: ['flowchart', 'mindmap'] },
        title: { type: 'string' },
        cluster_id: { type: 'string', description: 'Optional cluster ID' }
      },
      required: ['prompt', 'diagramType', 'title']
    }
  }
]
