import { getDatabase } from '../../db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = getDatabase()
  
  const stmt = db.prepare(`
    INSERT INTO projects (name, slug, description, owner_id, status) 
    VALUES (?, ?, ?, ?, ?)
  `)
  
  const result = stmt.run(
    body.name,
    body.slug,
    body.description || null,
    body.owner_id,
    body.status || 'active'
  )
  
  const project = db.prepare(`
    SELECT p.*, u.username as owner_name 
    FROM projects p 
    LEFT JOIN users u ON p.owner_id = u.id 
    WHERE p.id = ?
  `).get(result.lastInsertRowid)
  
  return project
})
