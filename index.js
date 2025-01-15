import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import { verifyJWT } from "./src/utils/verifyJWT.js";
import loginRouter from "./src/routers/login.js";
import userRouter from "./src/routers/user.js";
import eventRouter from "./src/routers/event.js";

const app = express();
const PORT = process.env.PORT;

const allowedOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests from specific origins or requests without an origin (e.g., Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(bodyParser.json({ limit: "4kb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "4kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello from server");
});

app.use("/", loginRouter);
app.use("/user", verifyJWT, userRouter);
app.use("/event", verifyJWT, eventRouter);

mongoose
  .connect(
    "mongodb+srv://nishthaa2003:nishthaa2003@eventrsvpmanager.bcdpz.mongodb.net/?retryWrites=true&w=majority&appName=EventRSVPManager"
  )
  .then(() => {
    app.listen(PORT, () => {
      console.log("http://localhost:" + PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });
