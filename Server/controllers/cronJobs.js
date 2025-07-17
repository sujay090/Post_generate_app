import cron from "node-cron";
import Schedule from "../models/Schedule.js";
import sendWhatsApp from "../utils/sendWhatsaap.js";
import Customer from "../models/Customer.js";
import moment from "moment-timezone";
import { DEFAULT_TIMEZONE, getISTTime, formatForIST, logTimezoneInfo } from "../config/timezone.js";

// Run every minute
cron.schedule("* * * * *", async () => {
  console.log("⏱️ Checking scheduled messages...");

  // Get current time in IST timezone regardless of server location
  const nowIST = getISTTime();
  console.log(`Current IST time: ${formatForIST(nowIST)}`);

  // Create time range for current minute in IST
  const startOfMinute = nowIST.clone().startOf('minute').toDate();
  const endOfMinute = nowIST.clone().endOf('minute').toDate();

  console.log(`Checking for schedules between ${startOfMinute.toISOString()} and ${endOfMinute.toISOString()}`);

  try {
    const schedules = await Schedule.find({
      date: { $gte: startOfMinute, $lte: endOfMinute },
      status: { $in: ["Pending", "Active"] }, // Include both Pending and Active statuses
    }).populate("customerId");
    
    console.log(`Found ${schedules.length} schedules to process`);
    
    if (schedules.length === 0) {
      console.log("No pending messages to send at this time.");
      return;
    }

  for (const schedule of schedules) {
    try {
      const customer = schedule.customerId;

      if (!customer || !customer.whatsapp) {
        console.error(`Schedule ${schedule._id}: Customer WhatsApp number not found`);
        schedule.status = "Failed";
        await schedule.save();
        continue;
      }

      const scheduleTimeIST = moment(schedule.date).tz(DEFAULT_TIMEZONE);
      console.log(`Processing schedule ${schedule._id} for ${customer.companyName} at ${formatForIST(scheduleTimeIST)} IST`);
      
      const phoneNumber = customer.whatsapp;

      // ✅ FIX: Construct the real media URL
      // const mediaUrl = `https://marketing.gs3solution.us/api/uploads/posters/6867f2cd75d28587cc3d19a7_1752719080050_68779a5d63358be1472c71c1.jpg`;
      const mediaUrl = `https://marketing.gs3solution.us/api/uploads/posters/${schedule.posterId}.jpg`;

      // 6867f2cd75d28587cc3d19a7_1752719080050_68779a5d63358be1472c71c1
      // const mediaUrl = `https://www.msgwapi.com/users/1/avatar.png`;
      await sendWhatsApp(phoneNumber, mediaUrl);

      schedule.status = "Sent";
      await schedule.save();

      console.log(`✅ Sent poster to ${phoneNumber} for customer ${customer.companyName} at ${formatForIST(scheduleTimeIST)} IST`);
    } catch (err) {
      schedule.status = "Failed";
      await schedule.save();

      console.error(`❌ Failed to send poster for schedule ${schedule._id}: ${err.message}`);
    }
  }

  } catch (err) {
    console.error("❌ Error fetching schedules:", err.message);
  }
});

// Initialize timezone logging on startup
logTimezoneInfo();
console.log("📅 Cron job initialized - Will check for scheduled messages every minute in IST timezone");
