const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const User      = require('../models/User');
const Hotel     = require('../models/Hotel');
const Transport = require('../models/Transport');
const Vendor    = require('../models/Vendor');
const Lead      = require('../models/Lead');
const Package   = require('../models/Package');

// GET /api/seed  — run only once to populate database
router.get('/', async (req, res) => {
  try {
    // Check karo already seeded hai ya nahi
    const existingAdmin = await User.findOne({ email: 'admin@travelandholidays.in' });
    if (existingAdmin) {
      return res.json({
        success: true,
        message: '✅ Already seeded! Admin user exists.',
        login: { email: 'admin@travelandholidays.in', password: 'admin123' },
      });
    }

    // Clear old data
    await Promise.all([
      User.deleteMany({}),
      Hotel.deleteMany({}),
      Transport.deleteMany({}),
      Vendor.deleteMany({}),
      Lead.deleteMany({}),
      Package.deleteMany({}),
    ]);

    // Admin user
    const admin = await User.create({
      name: 'Prakhar Sharma',
      email: 'admin@travelandholidays.in',
      password: 'admin123',
      role: 'admin',
      phone: '7000739379',
    });

    // Hotels
    await Hotel.insertMany([
      { name: 'Hotel Heaven View',          location: 'Amritsar',    city: 'Amritsar',    state: 'Punjab',           category: '3 Star', starRating: 3, cpRate: 2200, mapRate: 3000, peakRate: 3800, contactPerson: { name: 'Gurpreet Singh', phone: '9876500003' }, roomTypes: ['Standard','Deluxe','Family'], createdBy: admin._id },
      { name: 'Kumar Residency',            location: 'McLeod Ganj', city: 'Dharamshala', state: 'Himachal Pradesh', category: '2 Star', starRating: 2, cpRate: 1800, mapRate: 2500, peakRate: 3000, contactPerson: { name: 'Amit Kumar',    phone: '9876500002' }, roomTypes: ['Standard','Deluxe'], createdBy: admin._id },
      { name: 'Hotel Rosewood - Mall Road', location: 'Mall Road',   city: 'Manali',      state: 'Himachal Pradesh', category: '3 Star', starRating: 3, cpRate: 2500, mapRate: 3500, peakRate: 4500, contactPerson: { name: 'Raj Kumar',     phone: '9876500001' }, roomTypes: ['Standard','Deluxe','Suite'], createdBy: admin._id },
      { name: 'Hotel Anupam',               location: 'Kasol',       city: 'Kasol',       state: 'Himachal Pradesh', category: 'Budget', starRating: 2, cpRate: 1500, mapRate: 2000, peakRate: 2500, contactPerson: { name: 'Deepak',        phone: '9876500004' }, roomTypes: ['Standard','Dormitory'], createdBy: admin._id },
      { name: 'The White Land',             location: 'Shimla',      city: 'Shimla',      state: 'Himachal Pradesh', category: '3 Star', starRating: 4, cpRate: 2800, mapRate: 3800, peakRate: 5000, contactPerson: { name: 'Vinod Sharma',  phone: '9876500005' }, roomTypes: ['Standard','Deluxe','Mountain View'], createdBy: admin._id },
    ]);

    // Transport
    await Transport.insertMany([
      { vendorName: 'Himachal Travels', vehicleType: 'Tempo Traveller (17 Seat)', seatingCapacity: 17, ratePerDay: 4500, ratePerKm: 18, driver: { name: 'Ramesh Kumar', phone: '9800001111' }, status: 'available', createdBy: admin._id },
      { vendorName: 'Mountain Cabs',    vehicleType: 'Innova Crysta',             seatingCapacity: 7,  ratePerDay: 3500, ratePerKm: 14, driver: { name: 'Suresh Yadav', phone: '9800002222' }, status: 'available', createdBy: admin._id },
      { vendorName: 'Royal Sedan',      vehicleType: 'Swift Dzire',               seatingCapacity: 4,  ratePerDay: 2000, ratePerKm: 10, driver: { name: 'Mohit Sharma', phone: '9800005555' }, status: 'available', createdBy: admin._id },
    ]);

    // Vendors
    await Vendor.insertMany([
      { name: 'Himachal Travels', type: 'Transport', contactPerson: 'Ram Das',    phone: '9800001111', rating: 4, totalBusiness: 57000, totalPaid: 45000, outstanding: 12000, createdBy: admin._id },
      { name: 'Kumar Residency',  type: 'Hotel',     contactPerson: 'Amit Kumar', phone: '9876500002', rating: 3, totalBusiness: 40500, totalPaid: 32000, outstanding:  8500, createdBy: admin._id },
      { name: 'Adventure Kasol', type: 'Activity',  contactPerson: 'Rahul Negi', phone: '9900001234', rating: 5, totalBusiness: 15000, totalPaid: 15000, outstanding:     0, createdBy: admin._id },
    ]);

    // Leads
    await Lead.insertMany([
      { name: 'Rahul Sharma',       phone: '9876543210', destination: 'Himachal Pradesh', budget: 35000,  travelDates: 'Apr 15-22',   pax: 4,  status: 'new',         source: 'WhatsApp', assignedTo: admin._id, createdBy: admin._id },
      { name: 'Priya Mehta',        phone: '9988776655', destination: 'Goa',              budget: 20000,  travelDates: 'Apr 28-May 3', pax: 2,  status: 'contacted',   source: 'Website',  assignedTo: admin._id, createdBy: admin._id },
      { name: 'Vikram Patel',       phone: '8765432190', destination: 'Rajasthan',        budget: 80000,  travelDates: 'May 10-18',   pax: 6,  status: 'proposal',    source: 'Referral', assignedTo: admin._id, createdBy: admin._id },
      { name: 'Anita Singh',        phone: '7654321098', destination: 'Kerala',           budget: 50000,  travelDates: 'Jun 1-8',     pax: 3,  status: 'negotiation', source: 'Instagram',assignedTo: admin._id, createdBy: admin._id },
      { name: 'Mr. Chandrakishore', phone: '9000000001', destination: 'Himachal (Group)', budget: 561254, travelDates: 'Apr 15-22',   pax: 55, status: 'booked',      source: 'Direct',   assignedTo: admin._id, createdBy: admin._id },
    ]);

    // Packages
    await Package.insertMany([
      { name: '6N7D Himachal Premium',  destinations: ['Amritsar','Dharamshala','Manali','Kasol','Shimla'], nights: 6, days: 7, costPerPerson: 11225, inclusions: ['Hotel','Transport','Meals','Sightseeing'], exclusions: ['Personal expenses','Entry tickets'], createdBy: admin._id },
      { name: '5N6D Goa Beach Holiday', destinations: ['Goa'],                                               nights: 5, days: 6, costPerPerson: 9500,  inclusions: ['Hotel','Transport','Breakfast'],           exclusions: ['Lunch','Dinner','Personal expenses'],  createdBy: admin._id },
      { name: '7N8D Kerala Backwaters', destinations: ['Kochi','Munnar','Thekkady','Alleppey'],              nights: 7, days: 8, costPerPerson: 16000, inclusions: ['Hotel','Transport','Meals','Houseboat'],   exclusions: ['Personal expenses','Airfare'],         createdBy: admin._id },
    ]);

    res.json({
      success: true,
      message: '🎉 Database seeded successfully!',
      data: {
        admin:     '✅ Created',
        hotels:    '✅ 5 hotels added',
        transport: '✅ 3 vehicles added',
        vendors:   '✅ 3 vendors added',
        leads:     '✅ 5 leads added',
        packages:  '✅ 3 packages added',
      },
      login: {
        email:    'admin@travelandholidays.in',
        password: 'admin123',
        url:      'https://travelcrm-frontend-6sd9.onrender.com/login',
      },
    });

  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
