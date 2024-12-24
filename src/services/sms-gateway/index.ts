import axios from 'axios';
import { SendSMSDto } from './send-sms.dto';

const SMSGatewayConfig = {
  sms_gateway_username: process.env.SMS_GATEWAY_USERNAME,
  sms_gateway_password: process.env.SMS_GATEWAY_PASSWORD,
  sms_api_endpoint: process.env.SMS_API_ENDPOINT,
};
module.exports = sendSMS;
export async function sendSMS(payload: SendSMSDto) {
  console.log('Sending SMS to', payload.to, 'with content:', payload.content);
  const send_payload = JSON.stringify(payload);
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
}
