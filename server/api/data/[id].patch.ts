import { getDatabase } from '../../db'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params || {}
  const body = await readBody(event)
  const db = getDatabase()
  
  if (!id) {
    throw createError({ statusCode: 400, message: 'Record ID is required' })
  }
  
  const updates: string[] = []
  const values: any[] = []
  
  if (body.name !== undefined) {
    updates.push('name = ?')
    values.push(body.name)
  }
  
  if (body.data !== undefined) {
    updates.push('data = ?')
    values.push(JSON.stringify(body.data))
  }
  
  if (body.status !== undefined) {
    updates.push('status = ?')
    values.push(body.status)
  }
  
  if (body.user_id !== undefined) {
    updates.push('user_id = ?')
    values.push(body.user_id)
  }
  
  if (updates.length === 0) {
    throw createError({ statusCode: 400, message: 'No fields to update' })
  }
  
  updates.push('updated_at = CURRENT_TIMESTAMP')
  values.push(Number(id))
  
  const stmt = db.prepare(`UPDATE data SET ${updates.join(', ')} WHERE id = ?`)
  stmt.run(...values)
  
  const record = db.prepare(`
    SELECT d.*, u.username as user_name 
    FROM data d 
    LEFT JOIN users u ON d.user_id = u.id 
    WHERE d.id = ?
  `).get(Number(id))
  
  if (!record) {
    throw createError({ statusCode: 404, message: 'Record not found' })
  }
  
  return {
    ...(record as any),
    data: JSON.parse((record as any).data)
  }
})
