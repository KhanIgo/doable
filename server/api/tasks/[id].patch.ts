import { getDatabase } from '../../db'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params || {}
  const body = await readBody(event)
  const db = getDatabase()

  if (!id) {
    throw createError({ statusCode: 400, message: 'Task ID is required' })
  }

  const updates: string[] = []
  const values: any[] = []

  if (body.title !== undefined) {
    updates.push('title = ?')
    values.push(body.title)
  }

  if (body.description !== undefined) {
    updates.push('description = ?')
    values.push(body.description)
  }

  if (body.status !== undefined) {
    updates.push('status = ?')
    values.push(body.status)
  }

  if (body.project_id !== undefined) {
    updates.push('project_id = ?')
    values.push(body.project_id)
  }

  if (body.user_id !== undefined) {
    updates.push('user_id = ?')
    values.push(body.user_id)
  }

  if (body.data !== undefined) {
    updates.push('data = ?')
    values.push(JSON.stringify(body.data))
  }

  if (body.attachments !== undefined) {
    updates.push('attachments = ?')
    values.push(JSON.stringify(body.attachments))
  }

  if (body.comments !== undefined) {
    updates.push('comments = ?')
    values.push(JSON.stringify(body.comments))
  }

  if (body.tags !== undefined) {
    updates.push('tags = ?')
    values.push(JSON.stringify(body.tags))
  }

  if (body.labels !== undefined) {
    updates.push('labels = ?')
    values.push(JSON.stringify(body.labels))
  }

  if (body.assignees !== undefined) {
    updates.push('assignees = ?')
    values.push(JSON.stringify(body.assignees))
  }

  if (body.priority !== undefined) {
    updates.push('priority = ?')
    values.push(body.priority)
  }

  if (body.type !== undefined) {
    updates.push('type = ?')
    values.push(body.type)
  }

  if (body.subtasks !== undefined) {
    updates.push('subtasks = ?')
    values.push(JSON.stringify(body.subtasks))
  }

  if (body.due_date !== undefined) {
    updates.push('due_date = ?')
    values.push(body.due_date)
  }

  if (updates.length === 0) {
    throw createError({ statusCode: 400, message: 'No fields to update' })
  }

  updates.push('updated_at = CURRENT_TIMESTAMP')
  values.push(Number(id))

  const stmt = db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`)
  stmt.run(...values)

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(Number(id))

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
