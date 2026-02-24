import { getDatabase } from '../../db'
import { verifyPassword } from '../../utils/password'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = getDatabase()

  const { email, password } = body

  if (!email || !password) {
    throw createError({ 
      statusCode: 400, 
      message: 'Email and password are required' 
    })
  }

  const user = db.prepare(`
    SELECT id, username, email, role, avatar, status, password
    FROM users 
    WHERE email = ?
  `).get(email)

  if (!user) {
    throw createError({ 
      statusCode: 401, 
      message: 'Invalid email or password' 
    })
  }

  const isValid = verifyPassword(password, user.password)

  if (!isValid) {
    throw createError({ 
      statusCode: 401, 
      message: 'Invalid email or password' 
    })
  }

  const { password: _, ...userWithoutPassword } = user

  return {
    user: userWithoutPassword,
    token: 'mock-token-' + Date.now()
  }
})
