import express from "express";
import {
  getDeleteEvent,
  getEventById,
  getEvents,
  postCreateEvent,
  postUpdateEvent,
} from "../controllers/event.js";

const router = express.Router();
router.post("/create", postCreateEvent);
router.get("/", getEvents);
router.get("/:id", getEventById);
router.post("/update/:id", postUpdateEvent);
router.get("/delete/:id", getDeleteEvent);

export default router;
