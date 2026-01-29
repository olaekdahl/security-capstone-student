import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import { connectDb } from '../lib/db.js'
import { User } from '../models/User.js'
import { Item } from '../models/Item.js'

dotenv.config()

const url = process.env.MONGO_URL || 'mongodb://localhost:27017/incidenthubdb'
await connectDb(url)

const users = [
  { email: 'user1@example.com', role: 'user' },
  { email: 'tech1@example.com', role: 'technician' },
  { email: 'admin1@example.com', role: 'admin' }
]

for (const u of users) {
  const existing = await User.findOne({ email: u.email })
  if (!existing) {
    const passwordHash = await bcrypt.hash('Password123!', 10)
    await User.create({ ...u, passwordHash })
  }
}

const user = await User.findOne({ email: 'user1@example.com' }).lean()
const tech = await User.findOne({ email: 'tech1@example.com' }).lean()

if (user) {
  const existingItems = await Item.countDocuments()
  if (existingItems === 0) {
    await Item.insertMany([
      { 
        title: 'Cannot access email - Outlook crashes',
        description: 'Outlook crashes every time I try to open it. Error code 0x800CCC0F',
        priority: 'high',
        severity: 'major',
        category: 'software',
        affectedSystem: 'Microsoft Outlook 365',
        internalNotes: 'User profile may be corrupted. Check OST file size.',
        assignedTo: 'tech1@example.com',
        status: 'in-progress',
        ownerId: user._id, 
        ownerEmail: user.email 
      },
      { 
        title: 'VPN connection failing',
        description: 'Unable to connect to corporate VPN from home office',
        priority: 'critical',
        severity: 'critical',
        category: 'network',
        affectedSystem: 'Cisco AnyConnect VPN',
        internalNotes: 'CONFIDENTIAL: VPN server at 10.0.50.1 has certificate expiring soon. Do not share with users.',
        status: 'open',
        ownerId: user._id, 
        ownerEmail: user.email 
      },
      { 
        title: 'Request for admin access to dev server',
        description: 'Need elevated access to development server for deployment',
        priority: 'medium',
        severity: 'minor',
        category: 'access',
        affectedSystem: 'DEV-SERVER-01',
        internalNotes: 'SECURITY REVIEW REQUIRED. Check with manager before approving. Previous access request was denied.',
        assignedTo: 'admin1@example.com',
        status: 'pending',
        ownerId: tech._id, 
        ownerEmail: tech.email 
      },
      { 
        title: 'Suspicious login alerts',
        description: 'Received alerts about login attempts from unknown location',
        priority: 'critical',
        severity: 'critical',
        category: 'security',
        affectedSystem: 'Active Directory',
        internalNotes: 'INCIDENT RESPONSE: IP 185.234.xx.xx flagged in threat intel. Account temporarily disabled. Forensics in progress.',
        assignedTo: 'admin1@example.com',
        status: 'in-progress',
        ownerId: user._id, 
        ownerEmail: user.email 
      },
      { 
        title: 'Printer not working',
        description: 'HP LaserJet on 3rd floor showing offline',
        priority: 'low',
        severity: 'minor',
        category: 'hardware',
        affectedSystem: 'HP LaserJet Pro M404',
        resolution: 'Printer was unplugged. Reconnected power and network cable.',
        status: 'resolved',
        ownerId: user._id, 
        ownerEmail: user.email 
      }
    ])
  }
}

console.log('Seed complete.')
process.exit(0)
