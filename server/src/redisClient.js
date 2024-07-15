import { createClient } from 'redis';
import 'dotenv/config'

const client = createClient({
    password: process.env.REDIS_PWD,
    socket: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
    }
  });


export default client