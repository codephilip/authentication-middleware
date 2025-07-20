import { environment } from '../../example-service/src/config/environment';
import { getRedisClient } from '../utils/redis';

beforeAll(async () => {
  // Clear Redis before tests
  const redis = getRedisClient();
  await redis.flushall();
});

afterAll(async () => {
  const redis = getRedisClient();
  await redis.quit();
}); 