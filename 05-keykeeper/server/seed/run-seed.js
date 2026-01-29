import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import { connectDb } from '../lib/db.js'
import { User } from '../models/User.js'
import { Item } from '../models/Item.js'

dotenv.config()

const url = process.env.MONGO_URL || 'mongodb://localhost:27017/keykeeperdb'
await connectDb(url)

const users = [
  { email: 'dev1@example.com', role: 'developer' },
  { email: 'devops1@example.com', role: 'devops' },
  { email: 'admin1@example.com', role: 'admin' }
]

for (const u of users) {
  const existing = await User.findOne({ email: u.email })
  if (!existing) {
    const passwordHash = await bcrypt.hash('Password123!', 10)
    await User.create({ ...u, passwordHash })
  }
}

const dev = await User.findOne({ email: 'dev1@example.com' }).lean()
const devops = await User.findOne({ email: 'devops1@example.com' }).lean()
const admin = await User.findOne({ email: 'admin1@example.com' }).lean()

if (dev) {
  const existingItems = await Item.countDocuments()
  if (existingItems === 0) {
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)
    
    await Item.insertMany([
      { 
        name: 'GitHub Personal Access Token',
        description: 'PAT for CI/CD pipeline - repo access',
        secretType: 'token',
        secretValue: 'ghp_x8K2mN4pL9qR7wY3vU6tS1oF5jH8dE0bA2cZ',
        environment: 'development',
        service: 'GitHub',
        expiresAt: nextMonth,
        lastRotated: lastWeek,
        sharedWith: ['devops1@example.com'],
        status: 'active',
        ownerId: dev._id, 
        ownerEmail: dev.email,
        accessLog: [{ accessedBy: dev.email, action: 'created' }]
      },
      { 
        name: 'AWS Production Access Key',
        description: 'CRITICAL - Full S3 and EC2 access for production',
        secretType: 'api-key',
        secretValue: 'AKIAIOSFODNN7EXAMPLE:wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        environment: 'production',
        service: 'AWS',
        sharedWith: [],
        status: 'active',
        ownerId: admin._id, 
        ownerEmail: admin.email,
        accessLog: [{ accessedBy: admin.email, action: 'created' }]
      },
      { 
        name: 'Database Master Password',
        description: 'PostgreSQL master password for all environments',
        secretType: 'password',
        secretValue: 'Pr0d_DB_M@ster_2026!SecureP@ss',
        environment: 'production',
        service: 'PostgreSQL',
        lastRotated: lastWeek,
        sharedWith: ['admin1@example.com', 'devops1@example.com'],
        status: 'active',
        ownerId: devops._id, 
        ownerEmail: devops.email,
        accessLog: [{ accessedBy: devops.email, action: 'created' }]
      },
      { 
        name: 'Stripe API Key (Test)',
        description: 'Stripe test mode API key for development',
        secretType: 'api-key',
        secretValue: 'sk_test_4eC39HqLyjWDarjtT1zdp7dc',
        environment: 'development',
        service: 'Stripe',
        status: 'active',
        ownerId: dev._id, 
        ownerEmail: dev.email,
        accessLog: [{ accessedBy: dev.email, action: 'created' }]
      },
      { 
        name: 'Old Jenkins Token',
        description: 'Deprecated - migrated to GitHub Actions',
        secretType: 'token',
        secretValue: '11a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
        environment: 'staging',
        service: 'Jenkins',
        status: 'revoked',
        ownerId: devops._id, 
        ownerEmail: devops.email,
        accessLog: [
          { accessedBy: devops.email, action: 'created' },
          { accessedBy: admin.email, action: 'revoked' }
        ]
      },
      { 
        name: 'SendGrid API Key',
        description: 'Email service API key for transactional emails',
        secretType: 'api-key',
        secretValue: 'SG.aBcDeFgHiJkLmNoPqRsTuV.WxYz1234567890ABCDEFGHIJKLMNOP',
        environment: 'production',
        service: 'SendGrid',
        expiresAt: new Date('2026-06-30'),
        status: 'active',
        ownerId: dev._id, 
        ownerEmail: dev.email,
        accessLog: [{ accessedBy: dev.email, action: 'created' }]
      }
    ])
  }
}

console.log('Seed complete.')
process.exit(0)
