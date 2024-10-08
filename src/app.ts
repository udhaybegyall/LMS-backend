import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import bookRoutes from './routes/book.routes';
import userRoutes from './routes/user.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  optionSuccessStatus: 200
}
app.use(cors(corsOptions));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});






// import express from "express";
// import cors from "cors";
// import { pool } from "./config/database";

// import authRoutes from "./routes/userRoutes";
// import { errorHandler, notFound } from "./middleware/errorHandling";

// const app = express();

// app.use(express.json());
// app.use(cors());

// app.use("/auth", authRoutes);

// app.use(notFound);
// // app.use(errorHandler);

// app.get("/", (_req, res) => {
//   res.send("Hello World!");
// });

// // connect to database
// // query database to make sure connection is working
// pool.connect((err, client, release) => {
//   if (err || !client) {
//     console.log(err);
//     return;
//   }
//   client.query("SELECT NOW()", (err, result) => {
//     release();
//     if (err) {
//       console.log(err);
//       return;
//     }
//     console.log(result.rows);
//   });
// });

// app.listen(5000, () => {
//   console.log("Server is running on port 5000");
// });