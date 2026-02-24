import { getDatabase } from '../../db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = getDatabase()

  const stmt = db.prepare(`
    INSERT INTO sprints (name, description, status, user_id, data)
    VALUES (?, ?, ?, ?, ?)
  `)

  const result = stmt.run(
    body.name,
    body.description || null,
    body.status !== undefined ? body.status : 0,
    body.user_id,
    JSON.stringify(body.data || {})
  )

  const sprint = db.prepare(`
    SELECT s.*, u.username as user_name
    FROM sprints s
    LEFT JOIN users u ON s.user_id = u.id
    WHERE s.id = ?
  `).get(result.lastInsertRowid)

  return {
    ...(sprint as any),
    data: JSON.parse((sprint as any).data)
  }
})
