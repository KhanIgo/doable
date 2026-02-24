import { getDatabase, initDatabase } from '../db'
import { hashPassword } from '../utils/password'

export default defineNitroPlugin(async () => {
  initDatabase()
  
  const db = getDatabase()
  
  // Check if users already exist
  const count = db.prepare('SELECT COUNT(*) as count FROM users').get() as any
  
  if (count.count === 0) {
    console.log('Seeding database with initial users...')
    
    const users = [
      {
        username: 'admin',
        email: 'admin@example.com',
        password: 'password',
        role: 'admin',
        avatar: 'https://example.com/avatar.png',
        status: 'active',
        data: {}
      }
    ]
    
    const stmt = db.prepare(`
      INSERT INTO users (username, email, password, role, avatar, status, data) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    
    for (const user of users) {
      stmt.run(
        user.username,
        user.email,
        hashPassword(user.password),
        user.role,
        user.avatar,
        user.status,
        JSON.stringify(user.data)
      )
    }
    
    console.log('✓ Seeded', users.length, 'user(s)')
  }
})
