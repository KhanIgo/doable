import { getDatabase } from '../../db'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params || {}
  const db = getDatabase()

  if (!id) {
    throw createError({ statusCode: 400, message: 'Sprint ID is required' })
  }

  const stmt = db.prepare('DELETE FROM sprints WHERE id = ?')
  const result = stmt.run(Number(id))

  if (result.changes === 0) {
    throw createError({ statusCode: 404, message: 'Sprint not found' })
  }

  return { success: true }
})
