import { getDatabase } from '../../db'

export default defineEventHandler(() => {
  const db = getDatabase()
  const projects = db.prepare(`
    SELECT p.*, u.username as owner_name 
    FROM projects p 
    LEFT JOIN users u ON p.owner_id = u.id 
    ORDER BY p.created_at DESC
  `).all()
  
  return projects
})
