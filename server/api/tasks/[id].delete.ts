import { getDatabase } from '../../db'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params || {}
  const db = getDatabase()
  
  if (!id) {
    throw createError({ statusCode: 400, message: 'Task ID is required' })
  }
  
  const stmt = db.prepare('DELETE FROM tasks WHERE id = ?')
  const result = stmt.run(Number(id))
  
  if (result.changes === 0) {
    throw createError({ statusCode: 404, message: 'Task not found' })
  }
  
  return { success: true }
})
