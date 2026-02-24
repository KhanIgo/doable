import { getDatabase } from '../../db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = getDatabase()
  
  const stmt = db.prepare(`
    INSERT INTO data (name, data, status, user_id) 
    VALUES (?, ?, ?, ?)
  `)
  
  const result = stmt.run(
    body.name,
    JSON.stringify(body.data || {}),
    body.status !== undefined ? body.status : 0,
    body.user_id
  )
  
  const record = db.prepare(`
    SELECT d.*, u.username as user_name 
    FROM data d 
    LEFT JOIN users u ON d.user_id = u.id 
    WHERE d.id = ?
  `).get(result.lastInsertRowid)
  
  return {
    ...(record as any),
    data: JSON.parse((record as any).data)
  }
})
