// server/utils/seed.js
// Run: node utils/seed.js
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const User      = require('../models/User');
const Hotel     = require('../models/Hotel');
const Transport = require('../models/Transport');
const Vendor    = require('../models/Vendor');
const Lead      = require('../models/Lead');
const Package   = require('../models/Package');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/travel-crm');
  console.log('✅ Connected to MongoDB');

  // Clear
  await Promise.all([User, Hotel, Transport, Vendor, Lead, Package].map(M => M.deleteMany({})));
  console.log('🗑  Cleared existing data');

  // Admin user
  const admin = await User.create({
    name: 'Piyush Sharma', email: 'admin@travelandholidays.in',
    password: 'admin123', role: 'admin', phone: '7000739379',
  });
  console.log('👤 Admin user created — admin@travelandholidays.in / admin123');

  // Hotels
  await Hotel.insertMany([
    { name: 'Hotel Heaven View',          location: 'Amritsar',     city: 'Amritsar',     state: 'Punjab',           category: '3 Star', starRating: 3, cpRate: 2200, mapRate: 3000, peakRate: 3800, contactPerson: { name: 'Gurpreet Singh', phone: '9876500003' }, roomTypes: ['Standard','Deluxe','Family'], createdBy: admin._id },
    { name: 'Kumar Residency',            location: 'McLeod Ganj',  city: 'Dharamshala',  state: 'Himachal Pradesh', category: '2 Star', starRating: 2, cpRate: 1800, mapRate: 2500, peakRate: 3000, contactPerson: { name: 'Amit Kumar',    phone: '9876500002' }, roomTypes: ['Standard','Deluxe'], createdBy: admin._id },
    { name: 'Hotel Rosewood - Mall Road', location: 'Mall Road',    city: 'Manali',       state: 'Himachal Pradesh', category: '3 Star', starRating: 3, cpRate: 2500, mapRate: 3500, peakRate: 4500, contactPerson: { name: 'Raj Kumar',     phone: '9876500001' }, roomTypes: ['Standard','Deluxe','Suite'], createdBy: admin._id },
    { name: 'Hotel Anupam',               location: 'Kasol',        city: 'Kasol',        state: 'Himachal Pradesh', category: 'Budget', starRating: 2, cpRate: 1500, mapRate: 2000, peakRate: 2500, contactPerson: { name: 'Deepak',        phone: '9876500004' }, roomTypes: ['Standard','Dormitory'], createdBy: admin._id },
    { name: 'The White Land',             location: 'Shimla',       city: 'Shimla',       state: 'Himachal Pradesh', category: '3 Star', starRating: 4, cpRate: 2800, mapRate: 3800, peakRate: 5000, contactPerson: { name: 'Vinod Sharma',  phone: '9876500005' }, roomTypes: ['Standard','Deluxe','Mountain View'], createdBy: admin._id },
  ]);
  console.log('🏨 Hotels seeded');

  // Transport
  await Transport.insertMany([
    { vendorName: 'Himachal Travels', vehicleType: 'Tempo Traveller (17 Seat)', seatingCapacity: 17, ratePerDay: 4500, ratePerKm: 18, driver: { name: 'Ramesh Kumar',  phone: '9800001111' }, status: 'available', createdBy: admin._id },
    { vendorName: 'Mountain Cabs',    vehicleType: 'Innova Crysta',             seatingCapacity: 7,  ratePerDay: 3500, ratePerKm: 14, driver: { name: 'Suresh Yadav',  phone: '9800002222' }, status: 'available', createdBy: admin._id },
    { vendorName: 'Royal Sedan',      vehicleType: 'Swift Dzire',               seatingCapacity: 4,  ratePerDay: 2000, ratePerKm: 10, driver: { name: 'Mohit Sharma',  phone: '9800005555' }, status: 'available', createdBy: admin._id },
  ]);
  console.log('🚕 Transport seeded');

  // Vendors
  await Vendor.insertMany([
    { name: 'Himachal Travels', type: 'Transport', contactPerson: 'Ram Das',      phone: '9800001111', email: 'himachal@travel.com', rating: 4, totalBusiness: 57000, totalPaid: 45000, outstanding: 12000, createdBy: admin._id },
    { name: 'Kumar Residency',  type: 'Hotel',     contactPerson: 'Amit Kumar',   phone: '9876500002', email: 'kumar@residency.com',  rating: 3, totalBusiness: 40500, totalPaid: 32000, outstanding:  8500, createdBy: admin._id },
    { name: 'Adventure Kasol', type: 'Activity',  contactPerson: 'Rahul Negi',   phone: '9900001234', email: 'adventure@kasol.com',  rating: 5, totalBusiness: 15000, totalPaid: 15000, outstanding:     0, createdBy: admin._id },
  ]);
  console.log('🤝 Vendors seeded');

  // Sample leads
  await Lead.insertMany([
    { name: 'Rahul Sharma',       phone: '9876543210', destination: 'Himachal Pradesh', budget: 35000, travelDates: 'Apr 15-22', pax: 4, status: 'new',         source: 'WhatsApp', assignedTo: admin._id, createdBy: admin._id },
    { name: 'Priya Mehta',        phone: '9988776655', destination: 'Goa',              budget: 20000, travelDates: 'Apr 28–May 3', pax: 2, status: 'contacted', source: 'Website',  assignedTo: admin._id, createdBy: admin._id },
    { name: 'Vikram Patel',       phone: '8765432190', destination: 'Rajasthan',        budget: 80000, travelDates: 'May 10-18',  pax: 6, status: 'proposal',   source: 'Referral', assignedTo: admin._id, createdBy: admin._id },
    { name: 'Mr. Chandrakishore', phone: '9000000001', destination: 'Himachal (Group)', budget: 561254,travelDates: 'Apr 15-22',  pax: 55,status: 'booked',     source: 'Direct',   assignedTo: admin._id, createdBy: admin._id },
  ]);
  console.log('🧲 Leads seeded');

  // Packages
  await Package.insertMany([
    { name: '6N7D Himachal Premium', destinations: ['Amritsar','Dharamshala','Manali','Kasol','Shimla'], nights: 6, days: 7, costPerPerson: 11225, inclusions: ['Hotel','Transport','Meals','Sightseeing'], exclusions: ['Personal expenses','Entry tickets'], createdBy: admin._id },
    { name: '5N6D Goa Beach Holiday', destinations: ['Goa'], nights: 5, days: 6, costPerPerson: 9500, inclusions: ['Hotel','Transport','Breakfast'], exclusions: ['Lunch','Dinner','Personal expenses'], createdBy: admin._id },
  ]);
  console.log('📦 Packages seeded');

  console.log('\n✅ Seed complete! Login with:');
  console.log('   Email:    admin@travelandholidays.in');
  console.log('   Password: admin123\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
