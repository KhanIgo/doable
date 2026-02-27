import { getDatabase } from '../../../db'

export default defineEventHandler(async (event) => {
  const { slug } = event.context.params || {}
  
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Task slug is required' })
  }

  // Parse slug to extract project_slug and task_id
  // Format: {project.slug}-{task.id}
  const lastDashIndex = slug.lastIndexOf('-')
  
  if (lastDashIndex === -1) {
    throw createError({ statusCode: 400, message: 'Invalid task slug format' })
  }
  
  const projectSlug = slug.substring(0, lastDashIndex)
  const taskId = slug.substring(lastDashIndex + 1)
  
  const db = getDatabase()
  
  const task = db.prepare(`
    SELECT t.*, 
           p.name as project_name,
           p.slug as project_slug,
           u.username as user_name
    FROM tasks t
    LEFT JOIN projects p ON t.project_id = p.id
    LEFT JOIN users u ON t.user_id = u.id
    WHERE t.id = ? AND p.slug = ?
  `).get(Number(taskId), projectSlug)

  if (!task) {
    throw createError({ statusCode: 404, message: 'Task not found' })
  }

  return {
    ...(task as any),
    data: JSON.parse((task as any).data),
    attachments: JSON.parse((task as any).attachments),
    comments: JSON.parse((task as any).comments),
    tags: JSON.parse((task as any).tags),
    labels: JSON.parse((task as any).labels),
    assignees: JSON.parse((task as any).assignees),
    subtasks: JSON.parse((task as any).subtasks)
  }
})
