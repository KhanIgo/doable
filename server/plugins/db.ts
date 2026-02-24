import { initDatabase } from '../db'

export default defineNitroPlugin(() => {
  initDatabase()
})
