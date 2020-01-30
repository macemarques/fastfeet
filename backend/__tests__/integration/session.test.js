import request from 'supertest';
import app from '../../src/app';
import truncate from '../util/truncate';
import factory from '../factories';

describe('Session', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('Should be able to login', async () => {
    await request(app)
      .post('/users')
      .send({
        name: 'Distruidora FastFeet',
        email: 'admin@fastfeet.com',
        password: '123456',
      });

    const response = await request(app)
      .post('/sessions')
      .send({ email: 'admin@fastfeet.com', password: '123456' });

    expect(response.body).toHaveProperty('token');
  });

  it('Should not be able to login with a unregistred email', async () => {
    const user = await factory.attrs('Session');

    const response = await request(app)
      .post('/sessions')
      .send(user);

    expect(response.status).toBe(401);
  });

  it('Should not be able to login with a wrong password', async () => {
    await request(app)
      .post('/users')
      .send({
        name: 'Distruidora FastFeet',
        email: 'admin@fastfeet.com',
        password: '123456',
      });

    const response = await request(app)
      .post('/sessions')
      .send({ email: 'admin@fastfeet.com', password: 'wrongPassword' });

    expect(response.status).toBe(401);
  });
});
