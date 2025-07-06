import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

export default async function sendWhatsApp(to, imageUrl) {
  try {
    const fullNumber = `whatsapp:${to.startsWith('+') ? to : `+91${to}`}`;
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

    console.log(`📤 Sending WhatsApp to ${fullNumber}`);
    console.log(`🖼️ Image URL: ${imageUrl}`);

    const message = await client.messages.create({
      from: 'whatsapp:+14155238886',
      to: fullNumber,
      body: 'Here....',
      mediaUrl: [imageUrl],
    });

    console.log('✅ Twilio message SID:', message.sid);
    return message;
  } catch (error) {
    console.error('❌ Twilio send failed:', error.message);
    console.log("max ff")
    throw error;
  }
}
