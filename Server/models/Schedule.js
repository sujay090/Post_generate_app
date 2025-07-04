// models/Schedule.js
import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  posterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poster',
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  date: {
    type: Date, // or Date if you store it as Date
    required: true,
  },
  status:{
    type:String,
    enum:["Pending","Sent","Failed"],
    default:"Pending"
  }
});

export default mongoose.model('Schedule', scheduleSchema);
