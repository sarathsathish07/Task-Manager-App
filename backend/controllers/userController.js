import expressAsyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import Task from "../models/taskDetailsModel.js";

const authUser = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(401);
    res.json({ message: "Invalid email or password" });
  }
});
const googleLogin = async (req, res) => {
  const name = req.body.googleName;
  const email = req.body.googleEmail;
  const user = await User.findOne({ email });

  if (user) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    const newUser = await User.create({
      name,
      email,
    });
    if (newUser) {
      generateToken(res, newUser._id);
      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  }
};
const registerUser = expressAsyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});
const logoutUser = expressAsyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "User logged out" });
});

const createTask = async (req, res) => {
  try {
    console.log("Received task creation request with data:", req.body);
    console.log("req.user:", req.user);
    console.log("userId from body:", req.body.userId);

    const { title, description, assignedTo } = req.body;
    const userId = req.user?._id || req.body.userId;

    if (!userId) {
      console.error("User ID is missing in request");
      return res.status(400).json({ message: "User ID is missing" });
    }

    const newTask = new Task({
      user: userId,
      title,
      description,
      assignedTo,
    });

    console.log("Saving task to database:", newTask);

    await newTask.save();
    console.log("Task saved successfully");

    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getTasks = async (req, res) => {
  try {
    const { search = "", sort = "recent" } = req.query;

    const searchQuery = search
      ? { title: { $regex: search, $options: "i" } }
      : {};

    let sortQuery;
    switch (sort) {
      case "title":
        sortQuery = { title: 1 };
        break;
      case "recent":
        sortQuery = { createdAt: -1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }

    const tasks = await Task.find({
      user: req.user?._id || req.query.userId,
      ...searchQuery,
    }).sort(sortQuery);

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Error fetching tasks" });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { taskData, status } = req.body;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (taskData) {
      const { title, description, assignedTo } = taskData;
      task.title = title || task.title;
      task.description = description || task.description;
      task.assignedTo = assignedTo || task.assignedTo;
    }

    if (status) {
      task.status = status;
    }

    const updatedTask = await task.save();
    res.status(201).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (task) {
    await Task.deleteOne({ _id: task._id });
    res.json({ message: "Task removed" });
  } else {
    res.status(404);
    throw new Error("Task not found");
  }
};

export {
  authUser,
  registerUser,
  logoutUser,
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  googleLogin,
};
