import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import { connectDb } from '../lib/db.js'
import { User } from '../models/User.js'
import { Item } from '../models/Item.js'

dotenv.config()

const url = process.env.MONGO_URL || 'mongodb://localhost:27017/shipitdb'
await connectDb(url)

const users = [
  { email: 'customer1@example.com', role: 'customer' },
  { email: 'seller1@example.com', role: 'seller' },
  { email: 'admin1@example.com', role: 'admin' }
]

for (const u of users) {
  const existing = await User.findOne({ email: u.email })
  if (!existing) {
    const passwordHash = await bcrypt.hash('Password123!', 10)
    await User.create({ ...u, passwordHash })
  }
}

const seller = await User.findOne({ email: 'seller1@example.com' }).lean()
const admin = await User.findOne({ email: 'admin1@example.com' }).lean()

if (seller) {
  const existingItems = await Item.countDocuments()
  if (existingItems === 0) {
    await Item.insertMany([
      { 
        name: 'Wireless Bluetooth Headphones',
        description: 'Premium noise-canceling headphones with 30hr battery life',
        price: 149.99,
        originalPrice: 199.99,
        category: 'electronics',
        stock: 45,
        sku: 'ELEC-WBH-001',
        featured: true,
        status: 'active',
        ownerId: seller._id, 
        ownerEmail: seller.email 
      },
      { 
        name: 'Organic Cotton T-Shirt',
        description: 'Eco-friendly casual wear, available in multiple colors',
        price: 29.99,
        originalPrice: 29.99,
        category: 'clothing',
        stock: 150,
        sku: 'CLTH-OCT-042',
        featured: false,
        status: 'active',
        ownerId: seller._id, 
        ownerEmail: seller.email 
      },
      { 
        name: 'Smart Home Hub Pro',
        description: 'Control all your smart devices from one place',
        price: 89.99,
        originalPrice: 129.99,
        category: 'electronics',
        stock: 0,
        sku: 'ELEC-SHH-003',
        featured: true,
        status: 'out-of-stock',
        ownerId: admin._id, 
        ownerEmail: admin.email 
      },
      { 
        name: 'UNRELEASED: Gaming Console X',
        description: 'CONFIDENTIAL - Next-gen gaming console, launch Q4 2026',
        price: 499.99,
        originalPrice: 599.99,
        category: 'electronics',
        stock: 500,
        sku: 'ELEC-GCX-SECRET',
        featured: false,
        status: 'draft',
        ownerId: admin._id, 
        ownerEmail: admin.email 
      },
      { 
        name: 'Yoga Mat Premium',
        description: 'Extra thick, non-slip surface for comfortable workouts',
        price: 45.00,
        originalPrice: 60.00,
        category: 'sports',
        stock: 78,
        sku: 'SPRT-YMP-015',
        featured: false,
        status: 'active',
        ownerId: seller._id, 
        ownerEmail: seller.email 
      }
    ])
  }
}

console.log('Seed complete.')
process.exit(0)
