import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../../src/app';
import truncate from '../util/truncate';
import factory from '../factories';

describe('User', () => {
  beforeEach(async () => {
    await truncate();
  });
  it('Should not be able to register a user without a name', async () => {
    const user = await factory.attrs('User', { name: '' });

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(400);
  });
  it('Should not be able to register a user without a email', async () => {
    const user = await factory.attrs('User', { email: '' });

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(400);
  });
  it('Should not be able to register a user without a password', async () => {
    const user = await factory.attrs('User', { password: '' });

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(400);
  });

  it('Should encrypt user password when new user is created', async () => {
    const user = await factory.create('User', {
      password: '12345678',
    });

    const compareHash = await bcrypt.compare('12345678', user.password_hash);

    expect(compareHash).toBe(true);
  });

  it('Should be able to register', async () => {
    const user = await factory.attrs('User');

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.body).toHaveProperty('id');
  });

  it('Should not be able to register with a duplicated email', async () => {
    const user = await factory.attrs('User', { email: 'duplicated@gmail.com' });
    await request(app)
      .post('/users')
      .send(user);

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(400);
  });
});
