import { storage } from './storage';

// Seed initial rewards data
export async function seedRewards() {
  try {
    const sampleRewards = [
      {
        title: "₹50 Ola Discount",
        description: "Get ₹50 off on your next Ola ride",
        pointsCost: 100,
        category: "discount",
        value: 50,
        isActive: true
      },
      {
        title: "₹100 Uber Voucher",
        description: "₹100 voucher for Uber rides",
        pointsCost: 200,
        category: "voucher",
        value: 100,
        isActive: true
      },
      {
        title: "₹25 Cashback",
        description: "Get ₹25 cashback on any ride booking",
        pointsCost: 50,
        category: "cashback",
        value: 25,
        isActive: true
      },
      {
        title: "₹200 Namma Yatri Credit",
        description: "₹200 credit for Namma Yatri rides",
        pointsCost: 300,
        category: "voucher",
        value: 200,
        isActive: true
      },
      {
        title: "15% Off Next Ride",
        description: "15% discount on your next cab booking",
        pointsCost: 75,
        category: "discount",
        value: 15,
        isActive: true
      },
      {
        title: "₹500 Premium Voucher",
        description: "₹500 voucher for premium cab services",
        pointsCost: 800,
        category: "voucher",
        value: 500,
        isActive: true
      }
    ];

    for (const reward of sampleRewards) {
      await storage.createReward(reward);
    }

    console.log('✓ Sample rewards seeded successfully');
  } catch (error) {
    console.error('Error seeding rewards:', error);
  }
}