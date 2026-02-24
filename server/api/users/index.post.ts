import { getDatabase } from '../../db'
import { hashPassword } from '../../utils/password'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = getDatabase()

  const hashedPassword = hashPassword(body.password)

  const stmt = db.prepare(`
    INSERT INTO users (username, email, role, password, avatar, status, data)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  const result = stmt.run(
    body.username || null,
    body.email,
    body.role || 'user',
    hashedPassword,
    body.avatar || null,
    body.status || 'active',
    JSON.stringify(body.data || {})
  )

  const user = db.prepare('SELECT id, username, email, role, avatar, status, data, created_at, updated_at FROM users WHERE id = ?').get(result.lastInsertRowid)

  return {
    ...(user as any),
    data: JSON.parse((user as any).data)
  }
})
