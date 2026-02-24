import { getDatabase } from '../../db'

export default defineEventHandler(() => {
  const db = getDatabase()
  const records = db.prepare(`
    SELECT d.*, u.username as user_name 
    FROM data d 
    LEFT JOIN users u ON d.user_id = u.id 
    ORDER BY d.created_at DESC
  `).all()
  
  return records.map((record: any) => ({
    ...record,
    data: JSON.parse(record.data)
  }))
})
