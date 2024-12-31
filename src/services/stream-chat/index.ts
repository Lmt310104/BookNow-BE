import { StreamChat } from 'stream-chat';
const apiKey = process.env.STREAM_API_KEY;
const secretKey = process.env.STREAM_API_SECRET;

let instance = null;

const getStreamClient = () => {
  instance = StreamChat.getInstance(apiKey, secretKey);
  return instance;
};

export default getStreamClient;
