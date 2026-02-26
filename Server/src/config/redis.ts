import { createClient } from 'redis';

const client = createClient({
    url: 'redis://:root@127.0.0.1:6379'
});

client.on('error', (err) => {
    if (err.message !== 'Socket already opened') {
        console.error('Redis Client Error:', err);
    }
});

async () => {
    try {
        if (!client.isOpen) {
            await client.connect();
            console.log('Connected to Redis successfully!');
        }
    } catch (err) {
        console.error('Failed to connect to Redis', err);
    }
};

export async function connectRedis(): Promise<void> {
  try {
    if (!client.isOpen) {
      await client.connect();
      console.log('Connected to Redis successfully!');
    }
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
    throw err; // ném lỗi ra ngoài để server biết Redis không kết nối được
  }
}

export default client;