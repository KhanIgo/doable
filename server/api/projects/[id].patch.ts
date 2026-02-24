import { getDatabase } from '../../db'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params || {}
  const body = await readBody(event)
  const db = getDatabase()
  
  if (!id) {
    throw createError({ statusCode: 400, message: 'Project ID is required' })
  }
  
  const updates: string[] = []
  const values: any[] = []
  
  if (body.name !== undefined) {
    updates.push('name = ?')
    values.push(body.name)
  }
  
  if (body.slug !== undefined) {
    updates.push('slug = ?')
    values.push(body.slug)
  }
  
  if (body.description !== undefined) {
    updates.push('description = ?')
    values.push(body.description)
  }
  
  if (body.owner_id !== undefined) {
    updates.push('owner_id = ?')
    values.push(body.owner_id)
  }
  
  if (body.status !== undefined) {
    updates.push('status = ?')
    values.push(body.status)
  }
  
  if (updates.length === 0) {
    throw createError({ statusCode: 400, message: 'No fields to update' })
  }
  
  updates.push('updated_at = CURRENT_TIMESTAMP')
  values.push(Number(id))
  
  const stmt = db.prepare(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`)
  stmt.run(...values)
  
  const project = db.prepare(`
    SELECT p.*, u.username as owner_name 
    FROM projects p 
    LEFT JOIN users u ON p.owner_id = u.id 
    WHERE p.id = ?
  `).get(Number(id))
  
  if (!project) {
    throw createError({ statusCode: 404, message: 'Project not found' })
  }
  
  return project
})
