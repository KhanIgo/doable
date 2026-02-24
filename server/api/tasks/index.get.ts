import { getDatabase } from '../../db'

export default defineEventHandler(() => {
  const db = getDatabase()
  const tasks = db.prepare(`
    SELECT t.*, 
           p.name as project_name,
           u.username as user_name
    FROM tasks t
    LEFT JOIN projects p ON t.project_id = p.id
    LEFT JOIN users u ON t.user_id = u.id
    ORDER BY t.created_at DESC
  `).all()

  return tasks.map((task: any) => ({
    ...task,
    data: JSON.parse(task.data),
    attachments: JSON.parse(task.attachments),
    comments: JSON.parse(task.comments),
    tags: JSON.parse(task.tags),
    labels: JSON.parse(task.labels),
    assignees: JSON.parse(task.assignees),
    subtasks: JSON.parse(task.subtasks)
  }))
})
