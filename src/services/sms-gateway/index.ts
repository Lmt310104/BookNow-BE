import { SendSMSDto } from "./send-sms.dto";

const SMSGatewayConfig = {
  sms_gateway_username: process.env.SMS_GATEWAY_USERNAME,
  sms_gateway_password: process.env.SMS_GATEWAY_PASSWORD,
  sms_api_endpoint: process.env.SMS_API_ENDPOINT,
};

export async function sendSMS(payload: SendSMSDto){
  console.log('Sending SMS to', payload.to, 'with content:', payload.content);
}