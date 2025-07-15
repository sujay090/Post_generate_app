import cron from "node-cron";
import Schedule from "../models/Schedule.js";
import sendWhatsApp from "../utils/sendWhatsaap.js";
import Customer from "../models/Customer.js";

// Run every minute
cron.schedule("* * * * *", async () => {
  console.log("⏱️ Checking scheduled messages...");

  const now = new Date();

  const startOfMinute = new Date(now);
  startOfMinute.setSeconds(0, 0);

  const endOfMinute = new Date(now);
  endOfMinute.setSeconds(59, 999);

  try {
    const schedules = await Schedule.find({
      date: { $gte: startOfMinute, $lte: endOfMinute },
      status: "Pending",
    }).populate("customerId"); // ✅ Fix: Ensure the field is lowercase as defined in your schema
      console.log(schedules)
    if (schedules.length === 0) {
      console.log("No pending messages to send at this time.");
      return;
    }

  for (const schedule of schedules) {
  try {
    const customer = schedule.customerId;

    if (!customer || !customer.whatsapp) {
      throw new Error("Customer WhatsApp number not found");
    }

    const phoneNumber = customer.whatsapp;

    // ✅ FIX: Construct the real media URL
    const mediaUrl = `https://marketing.gs3solution.us/api/uploads/posters/${schedule.posterId}.jpg`;
    // const mediaUrl = `https://www.msgwapi.com/users/1/avatar.png`
    await sendWhatsApp(phoneNumber, mediaUrl);

    schedule.status = "Sent";
    await schedule.save();

    console.log(`✅ Sent poster to ${phoneNumber}`);
  } catch (err) {
    schedule.status = "Failed";
    await schedule.save();

    console.error(`❌ Failed to send poster: ${err.message}`);
  }
}

  } catch (err) {
    console.error("❌ Error fetching schedules:", err.message);
  }
});
