import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors"; 

const app = express();
const port = process.env.PORT || 5000;

connectDB();

app.use(cors({
  origin: "https://task-manager-app-7e1v-1qh2cbcx1-sarath-sathishs-projects.vercel.app", 
  credentials: true,  // Allows cookies and other credentials
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("backend/public"));

app.use("https://task-manager-app-l2ru.onrender.com/api/users", userRoutes);
app.get("/", (req, res) => res.send("Server is ready"));
app.use(notFound);
app.use(errorHandler);

export default app;

app.listen(port, () => console.log(`Server started on port ${port}`));
