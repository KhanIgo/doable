import { getDatabase } from '../../db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = getDatabase()

  const stmt = db.prepare(`
    INSERT INTO tasks (title, description, status, project_id, user_id, data, attachments, comments, tags, labels, assignees, priority, type, subtasks, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const result = stmt.run(
    body.title,
    body.description || null,
    body.status !== undefined ? body.status : 0,
    body.project_id,
    body.user_id,
    JSON.stringify(body.data || {}),
    JSON.stringify(body.attachments || {}),
    JSON.stringify(body.comments || {}),
    JSON.stringify(body.tags || {}),
    JSON.stringify(body.labels || {}),
    JSON.stringify(body.assignees || {}),
    body.priority !== undefined ? body.priority : 0,
    body.type || 'task',
    JSON.stringify(body.subtasks || {}),
    body.due_date || null
  )

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid)

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
