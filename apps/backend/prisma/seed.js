const { PrismaClient } = require("@prisma/client");
const { DEFAULT_USER_ID } = require("../src/config");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Delete all in correct order
  await prisma.booking.deleteMany();
  await prisma.eventType.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.user.deleteMany();

  // Create default user (simulating logged-in admin)
  const user = await prisma.user.create({
    data: {
      id: DEFAULT_USER_ID,
      name: "Alex Johnson",
      email: "alex@example.com",
      username: "alex",
      timezone: "America/New_York",
    },
  });

  // Create event types
  const et1 = await prisma.eventType.create({
    data: {
      userId: user.id,
      name: "30 Minute Meeting",
      slug: "30min",
      duration: 30,
      description: "A quick 30-minute sync to discuss your needs.",
      color: "#0069ff",
    },
  });

  const et2 = await prisma.eventType.create({
    data: {
      userId: user.id,
      name: "60 Minute Meeting",
      slug: "60min",
      duration: 60,
      description: "An in-depth 1-hour meeting for detailed discussions.",
      color: "#7c3aed",
    },
  });

  const et3 = await prisma.eventType.create({
    data: {
      userId: user.id,
      name: "15 Minute Intro Call",
      slug: "intro",
      duration: 15,
      description: "A short intro call to get to know each other.",
      color: "#059669",
    },
  });

  // Set availability: Mon-Fri, 9am-5pm
  const weekdays = [1, 2, 3, 4, 5]; // Mon–Fri
  for (const day of weekdays) {
    await prisma.availability.create({
      data: {
        userId: user.id,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "17:00",
      },
    });
  }

  // Seed some upcoming bookings
  const now = new Date();

  const upcomingDate1 = new Date(now);
  upcomingDate1.setDate(upcomingDate1.getDate() + 2);
  upcomingDate1.setHours(10, 0, 0, 0);

  const upcomingDate2 = new Date(now);
  upcomingDate2.setDate(upcomingDate2.getDate() + 3);
  upcomingDate2.setHours(14, 0, 0, 0);

  const upcomingDate3 = new Date(now);
  upcomingDate3.setDate(upcomingDate3.getDate() + 5);
  upcomingDate3.setHours(11, 0, 0, 0);

  // Past bookings
  const pastDate1 = new Date(now);
  pastDate1.setDate(pastDate1.getDate() - 3);
  pastDate1.setHours(9, 0, 0, 0);

  const pastDate2 = new Date(now);
  pastDate2.setDate(pastDate2.getDate() - 7);
  pastDate2.setHours(15, 0, 0, 0);

  await prisma.booking.createMany({
    data: [
      {
        userId: user.id,
        eventTypeId: et1.id,
        inviteeName: "Priya Sharma",
        inviteeEmail: "priya@example.com",
        startTime: upcomingDate1,
        endTime: new Date(upcomingDate1.getTime() + 30 * 60000),
        timezone: "Asia/Kolkata",
        status: "CONFIRMED",
      },
      {
        userId: user.id,
        eventTypeId: et2.id,
        inviteeName: "Rohan Verma",
        inviteeEmail: "rohan@example.com",
        startTime: upcomingDate2,
        endTime: new Date(upcomingDate2.getTime() + 60 * 60000),
        timezone: "Asia/Kolkata",
        status: "CONFIRMED",
      },
      {
        userId: user.id,
        eventTypeId: et3.id,
        inviteeName: "Ananya Singh",
        inviteeEmail: "ananya@example.com",
        startTime: upcomingDate3,
        endTime: new Date(upcomingDate3.getTime() + 15 * 60000),
        timezone: "UTC",
        status: "CONFIRMED",
      },
      {
        userId: user.id,
        eventTypeId: et1.id,
        inviteeName: "Vikram Patel",
        inviteeEmail: "vikram@example.com",
        startTime: pastDate1,
        endTime: new Date(pastDate1.getTime() + 30 * 60000),
        timezone: "Asia/Kolkata",
        status: "CONFIRMED",
      },
      {
        userId: user.id,
        eventTypeId: et2.id,
        inviteeName: "Meera Nair",
        inviteeEmail: "meera@example.com",
        startTime: pastDate2,
        endTime: new Date(pastDate2.getTime() + 60 * 60000),
        timezone: "Asia/Kolkata",
        status: "CANCELLED",
        cancelReason: "Scheduling conflict",
      },
    ],
  });

  console.log("✅ Seed complete!");
  console.log(`   User: ${user.name} (${user.username})`);
  console.log(`   Event types: 3`);
  console.log(`   Availability: Mon–Fri 9am–5pm`);
  console.log(`   Bookings: 5 (3 upcoming, 2 past)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
