import { getDatabase } from '../../db'
import { hashPassword } from '../../utils/password'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params || {}
  const body = await readBody(event)
  const db = getDatabase()

  if (!id) {
    throw createError({ statusCode: 400, message: 'User ID is required' })
  }

  const updates: string[] = []
  const values: any[] = []

  if (body.username !== undefined) {
    updates.push('username = ?')
    values.push(body.username)
  }

  if (body.email !== undefined) {
    updates.push('email = ?')
    values.push(body.email)
  }

  if (body.role !== undefined) {
    updates.push('role = ?')
    values.push(body.role)
  }

  if (body.password !== undefined) {
    updates.push('password = ?')
    values.push(hashPassword(body.password))
  }

  if (body.avatar !== undefined) {
    updates.push('avatar = ?')
    values.push(body.avatar)
  }

  if (body.status !== undefined) {
    updates.push('status = ?')
    values.push(body.status)
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

  const stmt = db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`)
  stmt.run(...values)

  const user = db.prepare('SELECT id, username, email, role, avatar, status, data, created_at, updated_at FROM users WHERE id = ?').get(Number(id))

  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  return {
    ...(user as any),
    data: JSON.parse((user as any).data)
  }
})
