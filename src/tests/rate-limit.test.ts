import request from 'supertest';
import { app } from '../../example-service/src/server';

describe('Rate Limiting', () => {
  it('should limit requests to protected endpoints', async () => {
    const makeRequests = Array(11).fill(null).map(() => 
      request(app).get('/api/limited')
    );

    const responses = await Promise.all(makeRequests);
    const tooManyRequests = responses.filter(r => r.status === 429);
    
    expect(tooManyRequests.length).toBeGreaterThan(0);
  });
}); 