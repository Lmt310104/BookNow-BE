import axios from 'axios';
import { SendSMSDto } from './send-sms.dto';

const SMSGatewayConfig = {
  sms_gateway_username: process.env.SMS_GATEWAY_USERNAME,
  sms_gateway_password: process.env.SMS_GATEWAY_PASSWORD,
  sms_api_endpoint: process.env.SMS_API_ENDPOINT,
};
export default async function sendSMS(payload: SendSMSDto) {
  try {
    const phoneNumbers = [];
    phoneNumbers.push(convertPhoneNumber(payload.to));
    console.log('Sending SMS to', payload.to, 'with content:', payload.content);
    const send_payload = JSON.stringify({
      message: payload.content,
      phoneNumbers: phoneNumbers,
    });
    const { data } = await axios.post(
      `${SMSGatewayConfig.sms_api_endpoint}`,
      send_payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        auth: {
          username: SMSGatewayConfig.sms_gateway_username,
          password: SMSGatewayConfig.sms_gateway_password,
        },
      },
    );
    console.log(data);
  } catch (error) {
    console.log(error);
    throw new Error('Failed to send SMS');
  }
}
function convertPhoneNumber(phoneNumber: string): string {
  if (phoneNumber.startsWith('0')) {
    return '+84' + phoneNumber.slice(1);
  }
  if (phoneNumber.startsWith('+84')) {
    return phoneNumber;
  }
  throw new Error('Invalid phone number format');
}
