import Schedule from "../models/Schedule.js";
import nodeSchedule from "node-schedule";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const postSchedule = (
  postTime,
  content = "Test",
  imageUrls = [],
  phoneNumber
) => {
  const scheduledDate = new Date(postTime);
  console.log(phoneNumber, imageUrls);
  if (isNaN(scheduledDate)) {
    console.error("Invalid date provided to postSchedule:", postTime);
    return null;
  }

  const job = nodeSchedule.scheduleJob(scheduledDate, () => {
    console.log("----- Whatsapp Schedule Start -------");
    if (phoneNumber) {
      for (const imageUrl of imageUrls) {
        axios
          .get(
            `https://www.msgwapi.com/api/whatsapp/send?receiver=${phoneNumber}&msgtext=${content}&token=${process.env.WHATSAPP_API_TOKEN}&mediaurl=${imageUrl}`
          )
          .then((res) => {
            console.log(res.data);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    } else {
      console.log("Phone number not found.");
    }
    console.log("----- Whatsapp Schedule End -------");
  });

  return job;
};

export const createSchedule = async (req, res) => {
  try {
    const { customerId, schedules, customerPhoneNumber } = req.body;
    console.log("Create SS", customerPhoneNumber, schedules);
    if (!Array.isArray(schedules) || schedules.length === 0) {
      return res
        .status(400)
        .json({ message: "Schedules must be a non-empty array" });
    }

    const entries = [];

    schedules.forEach((item) => {
      const { posterId, categories, dates, selectedPosterUrls } = item;

      categories.forEach((category) => {
        dates.forEach((date) => {
          const parseDate = new Date(date)
          entries.push({
            customerId,
            posterId,
            category,
            date:parseDate,
          });
          

          // Schedule the job
          // postSchedule(
          //   date,
          //   `Poster ID: ${posterId} - Category: ${category}`,
          //   selectedPosterUrls,
          //   customerPhoneNumber
          // );
        });
      });
    });

    const createdSchedules = await Schedule.insertMany(entries);

    res.status(201).json({
      message: "Posters scheduled successfully",
      schedules: createdSchedules,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getScheduleByCustomer = async (req, res) => {
  try {
    const schedules = await Schedule.find({
      customerId: req.params.customerId,
    }).populate("posterId");
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate("customerId", "companyName") // ✅ Fetch customer name
      .populate("posterId", "title"); // Optional: fetch poster title

    console.log("All scheduled jobs:");
    console.log(Object.keys(nodeSchedule.scheduledJobs));
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: "Error fetching schedules", error });
  }
};

export const deleteSchedule = async (req, res) => {
  try {
    const deleted = await Schedule.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Schedule not found" });
    res.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
