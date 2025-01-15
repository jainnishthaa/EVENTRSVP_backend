import Event from "../Models/eventModel.js";
import User from "../Models/userModel.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { responseHandler } from "../utils/responseHandler.js";

export const postCreateEvent = responseHandler(async (req, res, next) => {
  try {
    const { title, date, time, location, description } = req.body;
    // console.log(title);
    const user = await User.findOne({ _id: req.user.userId });

    const event = await Event.create({
      title,
      date,
      time,
      location,
      description,
      organiser: req.user.userId,
    });

    user.events.push(event._id);
    await user.save();

    res.status(201).json({
      message: "Event created successfully",
      event: event,
    });
  } catch (error) {
    throw new ErrorHandler(
      error.status || 500,
      error.message || "can't create event right now"
    );
  }
});

export const getEvents = responseHandler(async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const today = new Date();
    // const twoDaysLater = new Date(today.setDate(today.getDate() + 1))
    const events = await Event.find().populate("organiser", "name");
    const eventsWithFlags = events
      .filter((event) => {
        if (event.date >= today) {
          // console.log(event.date);
          return event;
        }
      })
      .map((event) => {
        return {
          ...event.toObject(),
          role: event.organiser.toString() === userId ? "organizer" : "rsvp",
        };
      });
    res.status(200).json({
      message: "Events fetched successfully",
      events: eventsWithFlags,
    });
  } catch (error) {
    throw new ErrorHandler(
      error.status || 500,
      error.message || "can't fetch events right now"
    );
  }
});

export const getEventById = responseHandler(async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.userId;
    const event = await Event.findById(eventId).populate("organiser", "name");
    if (!event) {
      throw new ErrorHandler(400, "event not found");
    }
    const role =
      event.organiser._id.toString() === userId
        ? "organizer"
        : event.attendees.includes(userId)
        ? "rsvped"
        : "rsvp";
    console.log(role);
    res.status(200).json({
      message: "Event fetched successfully",
      event: event,
      role: role,
    });
  } catch (error) {
    throw new ErrorHandler(
      error.status || 500,
      error.message || "can't fetch event right now"
    );
  }
});

export const postUpdateEvent = responseHandler(async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.userId;
    const { title, date, time, location, description } = req.body;
    const event = await Event.findById(eventId);
    if (!event) {
      throw new ErrorHandler(400, "event not found");
    }
    if (event.organiser.toString() !== userId) {
      throw new ErrorHandler(
        400,
        "you are not authorized to update this event"
      );
    }
    if (title) {
      event.title = title;
    }
    if (date) {
      event.date = date;
    }
    if (time) {
      event.time = time;
    }
    if (location) {
      event.location = location;
    }
    if (description) {
      event.description = description;
    }
    await event.save();
    res.status(200).json({
      message: "Event updated successfully",
      event: event,
    });
  } catch (error) {
    throw new ErrorHandler(
      error.status || 500,
      error.message || "can't update event right now"
    );
  }
});

export const getDeleteEvent = responseHandler(async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.userId;
    const event = await Event.findById(eventId);
    if (event.organiser.toString() !== userId) {
      throw new ErrorHandler(
        400,
        "you are not authorized to delete this event"
      );
    }
    await User.updateMany({ events: eventId }, { $pull: { events: eventId } });
    await Event.findByIdAndDelete(eventId);
    res.status(200).json({
      message: "Event deleted successfully",
    });
  } catch (error) {
    throw new ErrorHandler(
      error.status || 500,
      error.message || "can't delete event right now"
    );
  }
});
