import { createClient } from 'redis';
import { LogService } from '../services/systemLogService.js'; // adjust path

const client = createClient({
  url: 'redis://:root@127.0.0.1:6379'
});

client.on('error', (err) => {
  if (err.message !== 'Socket already opened') {
    console.error('[Redis] Client error:', err);
    // Runtime error từ redis client (mất kết nối đột ngột, timeout,...)
    LogService.write({
      message: `Redis runtime error: ${err.message}`,
      actor_type: 'system',
      type: 'error',
      status: 'failure',
      actionDetail: 'redis.runtime.error',
      metaData: { error: err.message, code: err.code } as any,
    });
  }
});

export async function connectRedis(): Promise<void> {
  try {
    if (!client.isOpen) {
      await client.connect();
      console.log('[Redis] Connected successfully');
      // Không cần log success vào DB — chỉ log failure là đủ với infra connection
    }
  } catch (err: any) {
    console.error('[Redis] Failed to connect:', err);
    // Third-party service timeout / connection error
    LogService.write({
      message: `Redis connection failed: ${err.message}`,
      actor_type: 'system',
      type: 'error',
      status: 'failure',
      actionDetail: 'redis.connection.error',
      metaData: { error: err.message, stack: err.stack } as any,
    });
    throw err;
  }
}

export default client;