import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import { connectDb } from '../lib/db.js'
import { User } from '../models/User.js'
import { Item } from '../models/Item.js'

dotenv.config()

const url = process.env.MONGO_URL || 'mongodb://localhost:27017/clinicqueuedb'
await connectDb(url)

const users = [
  { email: 'patient1@example.com', role: 'patient' },
  { email: 'nurse1@example.com', role: 'nurse' },
  { email: 'doctor1@example.com', role: 'doctor' }
]

for (const u of users) {
  const existing = await User.findOne({ email: u.email })
  if (!existing) {
    const passwordHash = await bcrypt.hash('Password123!', 10)
    await User.create({ ...u, passwordHash })
  }
}

const patient = await User.findOne({ email: 'patient1@example.com' }).lean()
const nurse = await User.findOne({ email: 'nurse1@example.com' }).lean()

if (patient) {
  const existingItems = await Item.countDocuments()
  if (existingItems === 0) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    
    await Item.insertMany([
      { 
        patientName: 'John Smith',
        patientDOB: '1985-03-15',
        patientPhone: '555-0123',
        appointmentDate: tomorrow,
        appointmentTime: '09:00',
        department: 'cardiology',
        doctor: 'Dr. Sarah Chen',
        reason: 'Annual heart checkup',
        status: 'scheduled',
        ownerId: patient._id, 
        ownerEmail: patient.email 
      },
      { 
        patientName: 'Emily Johnson',
        patientDOB: '1992-07-22',
        patientPhone: '555-0456',
        appointmentDate: tomorrow,
        appointmentTime: '10:30',
        department: 'dermatology',
        doctor: 'Dr. Michael Park',
        reason: 'Skin rash examination',
        status: 'checked-in',
        ownerId: nurse._id, 
        ownerEmail: nurse.email 
      },
      { 
        patientName: 'Robert Williams',
        patientDOB: '1978-11-08',
        patientPhone: '555-0789',
        appointmentDate: nextWeek,
        appointmentTime: '14:00',
        department: 'orthopedics',
        doctor: 'Dr. Lisa Thompson',
        reason: 'Knee pain follow-up',
        notes: 'Patient has history of ACL injury',
        status: 'scheduled',
        ownerId: patient._id, 
        ownerEmail: patient.email 
      },
      { 
        patientName: 'Maria Garcia',
        patientDOB: '2015-05-30',
        patientPhone: '555-0321',
        appointmentDate: new Date(),
        appointmentTime: '11:00',
        department: 'pediatrics',
        doctor: 'Dr. James Wilson',
        reason: 'Vaccination',
        status: 'completed',
        ownerId: nurse._id, 
        ownerEmail: nurse.email 
      }
    ])
  }
}

console.log('Seed complete.')
process.exit(0)
