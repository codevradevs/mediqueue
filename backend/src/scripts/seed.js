require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../modules/auth/user.model');
const Hospital = require('../modules/hospitals/hospital.model');
const Department = require('../modules/departments/department.model');
const Queue = require('../modules/queues/queue.model');
const Booking = require('../modules/bookings/booking.model');

const hospitals = [
  {
    name: 'Kenyatta National Hospital',
    description: 'Kenya\'s largest public referral hospital, offering comprehensive medical services across all specialties.',
    location: { address: 'Hospital Road, Upper Hill', city: 'Nairobi', county: 'Nairobi', coordinates: { lat: -1.3006, lng: 36.8073 } },
    contact: { phone: '+254 20 272 6300', email: 'info@knh.or.ke', website: 'www.knh.or.ke' },
    image: '/hospital-hero.jpg',
    isActive: true,
    operatingHours: {
      monday: { open: '08:00', close: '17:00' },
      tuesday: { open: '08:00', close: '17:00' },
      wednesday: { open: '08:00', close: '17:00' },
      thursday: { open: '08:00', close: '17:00' },
      friday: { open: '08:00', close: '17:00' },
      saturday: { open: '08:00', close: '13:00' },
      sunday: { open: '09:00', close: '13:00' },
    },
  },
  {
    name: 'Aga Khan University Hospital',
    description: 'A premier private hospital in Nairobi offering world-class healthcare with state-of-the-art facilities.',
    location: { address: '3rd Parklands Avenue', city: 'Nairobi', county: 'Nairobi', coordinates: { lat: -1.2637, lng: 36.8196 } },
    contact: { phone: '+254 20 366 2000', email: 'info@aku.edu', website: 'www.aku.edu' },
    image: '/doctor-kenya.jpg',
    isActive: true,
    operatingHours: {
      monday: { open: '07:00', close: '22:00' },
      tuesday: { open: '07:00', close: '22:00' },
      wednesday: { open: '07:00', close: '22:00' },
      thursday: { open: '07:00', close: '22:00' },
      friday: { open: '07:00', close: '22:00' },
      saturday: { open: '07:00', close: '20:00' },
      sunday: { open: '08:00', close: '18:00' },
    },
  },
  {
    name: 'Nairobi Hospital',
    description: 'One of East Africa\'s leading private hospitals, known for excellence in patient care and advanced medical technology.',
    location: { address: 'Argwings Kodhek Road, Hurlingham', city: 'Nairobi', county: 'Nairobi', coordinates: { lat: -1.2921, lng: 36.7873 } },
    contact: { phone: '+254 20 284 5000', email: 'info@nairobihospital.org', website: 'www.nairobihospital.org' },
    image: '/waiting-area.jpg',
    isActive: true,
    operatingHours: {
      monday: { open: '07:00', close: '21:00' },
      tuesday: { open: '07:00', close: '21:00' },
      wednesday: { open: '07:00', close: '21:00' },
      thursday: { open: '07:00', close: '21:00' },
      friday: { open: '07:00', close: '21:00' },
      saturday: { open: '08:00', close: '18:00' },
      sunday: { open: '08:00', close: '16:00' },
    },
  },
  {
    name: 'Mombasa County Referral Hospital',
    description: 'The main public referral hospital serving the Coast region, providing essential healthcare to Mombasa and surrounding counties.',
    location: { address: 'Moi Avenue', city: 'Mombasa', county: 'Mombasa', coordinates: { lat: -4.0435, lng: 39.6682 } },
    contact: { phone: '+254 41 231 1211', email: 'info@mombasahospital.go.ke' },
    image: '/family-healthcare.jpg',
    isActive: true,
    operatingHours: {
      monday: { open: '08:00', close: '17:00' },
      tuesday: { open: '08:00', close: '17:00' },
      wednesday: { open: '08:00', close: '17:00' },
      thursday: { open: '08:00', close: '17:00' },
      friday: { open: '08:00', close: '17:00' },
      saturday: { open: '08:00', close: '13:00' },
      sunday: { open: '09:00', close: '13:00' },
    },
  },
  {
    name: 'Kisumu County Referral Hospital',
    description: 'The leading healthcare facility in Western Kenya, serving patients from Kisumu and the Lake Victoria region.',
    location: { address: 'Kisumu-Kakamega Road', city: 'Kisumu', county: 'Kisumu', coordinates: { lat: -0.0917, lng: 34.7679 } },
    contact: { phone: '+254 57 202 2471', email: 'info@kisumuhosp.go.ke' },
    image: '/hospital-hero.jpg',
    isActive: true,
    operatingHours: {
      monday: { open: '08:00', close: '17:00' },
      tuesday: { open: '08:00', close: '17:00' },
      wednesday: { open: '08:00', close: '17:00' },
      thursday: { open: '08:00', close: '17:00' },
      friday: { open: '08:00', close: '17:00' },
      saturday: { open: '08:00', close: '13:00' },
      sunday: { open: '09:00', close: '13:00' },
    },
  },
  {
    name: 'Nakuru Level 5 Hospital',
    description: 'The main referral hospital for the Rift Valley region, offering specialized medical services to over 2 million residents.',
    location: { address: 'Hospital Road', city: 'Nakuru', county: 'Nakuru', coordinates: { lat: -0.3031, lng: 36.0800 } },
    contact: { phone: '+254 51 221 2222', email: 'info@nakuruhospital.go.ke' },
    image: '/doctor-kenya.jpg',
    isActive: true,
    operatingHours: {
      monday: { open: '08:00', close: '17:00' },
      tuesday: { open: '08:00', close: '17:00' },
      wednesday: { open: '08:00', close: '17:00' },
      thursday: { open: '08:00', close: '17:00' },
      friday: { open: '08:00', close: '17:00' },
      saturday: { open: '08:00', close: '13:00' },
      sunday: { open: '09:00', close: '13:00' },
    },
  },
];

const departmentTemplates = [
  { name: 'Outpatient Department (OPD)', avgServiceTime: 20, maxCapacity: 80 },
  { name: 'Accident & Emergency', avgServiceTime: 30, maxCapacity: 40 },
  { name: 'Dental Clinic', avgServiceTime: 25, maxCapacity: 30 },
  { name: 'Maternity & Antenatal', avgServiceTime: 20, maxCapacity: 50 },
  { name: 'Paediatrics', avgServiceTime: 15, maxCapacity: 60 },
  { name: 'Eye Clinic (Ophthalmology)', avgServiceTime: 20, maxCapacity: 35 },
  { name: 'Physiotherapy', avgServiceTime: 30, maxCapacity: 25 },
  { name: 'Laboratory Services', avgServiceTime: 10, maxCapacity: 100 },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Drop stale indexes that may conflict from old schema
    try { await mongoose.connection.collection('users').dropIndex('email_1'); } catch (_) {}

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Hospital.deleteMany({}),
      Department.deleteMany({}),
      Queue.deleteMany({}),
      Booking.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create super admin — linked to first hospital after hospitals are created
    const superAdmin = await User.create({
      name: 'MediQueue Admin',
      phone: '0700000000',
      password: 'admin1234',
      role: 'super_admin',
    });
    console.log('👤 Super admin created: 0700000000 / admin1234');

    // Create demo patient
    const patient = await User.create({
      name: 'Wanjiku Kamau',
      phone: '0712345678',
      password: 'password123',
      role: 'patient',
    });
    console.log('👤 Demo patient created: 0712345678 / password123');

    // Create hospitals
    const createdHospitals = await Hospital.insertMany(
      hospitals.map(h => ({ ...h, createdBy: superAdmin._id }))
    );
    console.log(`🏥 Created ${createdHospitals.length} hospitals`);

    // Link super admin to first hospital
    await User.findByIdAndUpdate(superAdmin._id, { hospitalId: createdHospitals[0]._id });
    console.log(`🔗 Super admin linked to: ${createdHospitals[0].name}`);

    // Create hospital admins + departments + queues
    for (const hospital of createdHospitals) {
      // Create admin for this hospital
      const adminPhone = `07${Math.floor(10000000 + Math.random() * 89999999)}`;
      const admin = await User.create({
        name: `${hospital.name} Admin`,
        phone: adminPhone,
        password: 'admin123',
        role: 'admin',
        hospitalId: hospital._id,
      });

      // Create 4-5 departments per hospital
      const numDepts = 4 + Math.floor(Math.random() * 3);
      const selectedDepts = departmentTemplates.slice(0, numDepts);

      for (const deptTemplate of selectedDepts) {
        const dept = await Department.create({
          ...deptTemplate,
          hospitalId: hospital._id,
          isActive: true,
        });

        // Create queue with realistic data
        const currentCount = Math.floor(Math.random() * 15);
        const totalServed = Math.floor(Math.random() * 40) + 10;
        await Queue.create({
          departmentId: dept._id,
          hospitalId: hospital._id,
          currentCount,
          totalServedToday: totalServed,
          status: 'open',
          lastUpdated: new Date(),
          lastResetDate: new Date().toISOString().split('T')[0],
        });
      }
    }
    console.log('🏢 Created departments and queues for all hospitals');

    // Create sample bookings for demo patient
    const firstHospital = createdHospitals[0];
    const firstDept = await Department.findOne({ hospitalId: firstHospital._id });
    if (firstDept) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      await Booking.create({
        userId: patient._id,
        hospitalId: firstHospital._id,
        departmentId: firstDept._id,
        scheduledTime: tomorrow,
        queueNumber: 5,
        status: 'confirmed',
        symptoms: 'Persistent headache and fever',
      });
    }
    console.log('📅 Created sample bookings');

    console.log('\n✅ Seed completed successfully!');
    console.log('\n🔑 Demo Credentials:');
    console.log('   Patient:     0712345678 / password123');
    console.log('   Super Admin: 0700000000 / admin1234  →  linked to Kenyatta National Hospital');
    console.log('\n   Hospital admins generated during seed use password: admin123');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
