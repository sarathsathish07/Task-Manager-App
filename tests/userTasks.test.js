import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { authUser, registerUser, googleLogin, logoutUser, createTask, getTasks, updateTask, deleteTask } from '../backend/controllers/userController'; // Adjust path as needed
import User from '../backend/models/userModel';
import Task from '../backend/models/taskDetailsModel';


const app = express();
app.use(express.json());


app.post('/api/users/auth', authUser);
app.post('/api/users/register', registerUser);
app.post('/api/users/google-login', googleLogin);
app.post('/api/users/logout', logoutUser);
app.post('/api/users/create-task', createTask);
app.get('/api/users/get-tasks', getTasks);
app.put('/api/users/update-task/:id', updateTask);
app.delete('/api/users/delete-task/:id', deleteTask);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  process.env.JWT_SECRET = 'your_jwt_secret';
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Task.deleteMany({});
});

describe('User Authentication Endpoints', () => {
  it('should authenticate a user and return a token in a cookie', async () => {
    const user = await User.create({ name: 'Test User', email: 'testuser@example.com', password: 'password123' });

    const response = await request(app)
      .post('/api/users/auth')
      .send({ email: user.email, password: 'password123' });

    expect(response.status).toBe(201);
    expect(response.headers['set-cookie']).toBeDefined();
    const cookies = response.headers['set-cookie'];
    expect(cookies[0]).toMatch(/jwt=/);

    expect(response.body).toHaveProperty('_id');
    expect(response.body).toHaveProperty('name', 'Test User');
    expect(response.body).toHaveProperty('email', 'testuser@example.com');
  });

  it('should fail to authenticate a user with incorrect credentials', async () => {
    const response = await request(app)
      .post('/api/users/auth')
      .send({ email: 'wronguser@example.com', password: 'wrongpassword' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid email or password');
  });
});

describe('User Registration Endpoints', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({ name: 'New User', email: 'newuser@example.com', password: 'password123' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body).toHaveProperty('name', 'New User');
    expect(response.body).toHaveProperty('email', 'newuser@example.com');
  });

  it('should fail to register a user if email already exists', async () => {
    await User.create({ name: 'Existing User', email: 'existing@example.com', password: 'password123' });

    const response = await request(app)
      .post('/api/users/register')
      .send({ name: 'Existing User', email: 'existing@example.com', password: 'password123' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('User already exists');
  });
});

describe('Google Login Endpoints', () => {
  it('should login or register a user via Google', async () => {
    const response = await request(app)
      .post('/api/users/google-login')
      .send({ googleName: 'Google User', googleEmail: 'googleuser@example.com' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body).toHaveProperty('name', 'Google User');
    expect(response.body).toHaveProperty('email', 'googleuser@example.com');
  });
});

describe('Task Endpoints', () => {
  let token;
  let userId;

  beforeEach(async () => {
    const userResponse = await request(app)
      .post('/api/users/register')
      .send({ name: 'Test User', email: 'testuser@example.com', password: 'password123' });

    userId = userResponse.body._id; 

    const authResponse = await request(app)
      .post('/api/users/auth')
      .send({ email: 'testuser@example.com', password: 'password123' });

    token = authResponse.headers['set-cookie'][0].split(';')[0].replace('jwt=', ''); 
  });

  it('should create a new task', async () => {
    const response = await request(app)
      .post('/api/users/create-task')
      .set('Cookie', [`jwt=${token}`]) 
      .send({
        userId:userId,
        title: 'Test Task',
        description: 'Task description',
        assignedTo: 'vishnu', 
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('title', 'Test Task');
    expect(response.body).toHaveProperty('description', 'Task description');
    expect(response.body).toHaveProperty('assignedTo', 'vishnu');
    expect(response.body).toHaveProperty('user', userId.toString());
  });

  it('should get tasks for a user', async () => {
    await Task.create({
      user: userId,
      title: 'Task 1',
      description: 'Description 1',
      assignedTo: 'John',
    });

    const response = await request(app)
    .get(`/api/users/get-tasks?userId=${userId}`)
      .set('Cookie', [`jwt=${token}`]);

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('title', 'Task 1');
  });

  it('should update a task', async () => {
    const task = await Task.create({
      user: userId,
      title: 'Task to Update',
      description: 'Description',
      assignedTo: 'John',
    });

    const response = await request(app)
      .put(`/api/users/update-task/${task._id}`)
      .set('Cookie', [`jwt=${token}`])
      .send({
        userId:userId,
        taskData: { title: 'Updated Task'},
        status: 'inprogress',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('title', 'Updated Task');
    expect(response.body).toHaveProperty('status', 'inprogress');
  });

  it('should delete a task', async () => {
    const task = await Task.create({
      user: userId,
      title: 'Task to Delete',
      description: 'Description',
    });

    const response = await request(app)
      .delete(`/api/users/delete-task/${task._id}`)
      .set('Cookie', [`jwt=${token}`]);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Task removed');

    const deletedTask = await Task.findById(task._id);
    expect(deletedTask).toBeNull();
  });
});



describe('Logout Endpoint', () => {
  it('should log out a user', async () => {
    const response = await request(app)
      .post('/api/users/logout')
      .send();

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User logged out');
  });
});
