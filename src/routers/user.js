import express from "express";
import {
  getAttendees,
  getCancelRsvpEvent,
  getRsvpEvent,
  getUserEvents,
} from "../controllers/user.js";

const router = express.Router();
router.get("/events", getUserEvents);
router.get("/rsvp/:id", getRsvpEvent);
router.get("/cancel-rsvp/:id", getCancelRsvpEvent);
router.get("/attendees/:id", getAttendees);

export default router;
