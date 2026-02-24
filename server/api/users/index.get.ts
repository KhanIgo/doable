import { getDatabase } from '../../db'

export default defineEventHandler(() => {
  const db = getDatabase()
  const users = db.prepare('SELECT id, username, email, role, avatar, status, data, created_at, updated_at FROM users ORDER BY created_at DESC').all()
  
  return users.map((user: any) => ({
    ...user,
    data: JSON.parse(user.data)
  }))
})
