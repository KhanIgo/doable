import { getDatabase } from '../../db'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params || {}
  const body = await readBody(event)
  const db = getDatabase()

  if (!id) {
    throw createError({ statusCode: 400, message: 'Sprint ID is required' })
  }

  const updates: string[] = []
  const values: any[] = []

  if (body.name !== undefined) {
    updates.push('name = ?')
    values.push(body.name)
  }

  if (body.description !== undefined) {
    updates.push('description = ?')
    values.push(body.description)
  }

  if (body.status !== undefined) {
    updates.push('status = ?')
    values.push(body.status)
  }

  if (body.user_id !== undefined) {
    updates.push('user_id = ?')
    values.push(body.user_id)
  }

  if (body.data !== undefined) {
    updates.push('data = ?')
    values.push(JSON.stringify(body.data))
  }

  if (updates.length === 0) {
    throw createError({ statusCode: 400, message: 'No fields to update' })
  }

  updates.push('updated_at = CURRENT_TIMESTAMP')
  values.push(Number(id))

  const stmt = db.prepare(`UPDATE sprints SET ${updates.join(', ')} WHERE id = ?`)
  stmt.run(...values)

  const sprint = db.prepare(`
    SELECT s.*, u.username as user_name
    FROM sprints s
    LEFT JOIN users u ON s.user_id = u.id
    WHERE s.id = ?
  `).get(Number(id))

  if (!sprint) {
    throw createError({ statusCode: 404, message: 'Sprint not found' })
  }

  return {
    ...(sprint as any),
    data: JSON.parse((sprint as any).data)
  }
})
