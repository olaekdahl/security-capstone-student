import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import { connectDb } from '../lib/db.js'
import { User } from '../models/User.js'
import { Item } from '../models/Item.js'

dotenv.config()

const url = process.env.MONGO_URL || 'mongodb://localhost:27017/fundflowdb'
await connectDb(url)

const users = [
  { email: 'student1@example.com', role: 'student' },
  { email: 'manager1@example.com', role: 'manager' },
  { email: 'admin1@example.com', role: 'admin' }
]

for (const u of users) {
  const existing = await User.findOne({ email: u.email })
  if (!existing) {
    const passwordHash = await bcrypt.hash('Password123!', 10)
    await User.create({ ...u, passwordHash })
  }
}

const student = await User.findOne({ email: 'student1@example.com' }).lean()
const manager = await User.findOne({ email: 'manager1@example.com' }).lean()

if (student) {
  const existingItems = await Item.countDocuments()
  if (existingItems === 0) {
    await Item.insertMany([
      { 
        title: 'Conference Travel - Seattle', 
        description: 'Flight and hotel for DevSecOps conference',
        amount: 1250.00,
        category: 'travel',
        status: 'submitted',
        ownerId: student._id, 
        ownerEmail: student.email 
      },
      { 
        title: 'Team Lunch - Q4 Planning', 
        description: 'Lunch meeting with security team',
        amount: 156.75,
        category: 'meals',
        status: 'approved',
        approvedBy: manager?._id,
        approvedAt: new Date(),
        ownerId: student._id, 
        ownerEmail: student.email 
      },
      { 
        title: 'Security Software License', 
        description: 'Annual Burp Suite Professional license',
        amount: 449.00,
        category: 'software',
        status: 'draft',
        ownerId: student._id, 
        ownerEmail: student.email 
      },
      { 
        title: 'Office Supplies', 
        description: 'Notebooks and whiteboard markers',
        amount: 45.99,
        category: 'supplies',
        status: 'reimbursed',
        approvedBy: manager?._id,
        approvedAt: new Date(Date.now() - 86400000),
        ownerId: manager._id, 
        ownerEmail: manager.email 
      }
    ])
  }
}

console.log('Seed complete.')
process.exit(0)
