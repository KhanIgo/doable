import { getDatabase } from '../../db'

export default defineEventHandler(() => {
  const db = getDatabase()
  const sprints = db.prepare(`
    SELECT s.*, u.username as user_name
    FROM sprints s
    LEFT JOIN users u ON s.user_id = u.id
    ORDER BY s.created_at DESC
  `).all()

  return sprints.map((sprint: any) => ({
    ...sprint,
    data: JSON.parse(sprint.data)
  }))
})
