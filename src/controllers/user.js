import Event from "../Models/eventModel.js";
import User from "../Models/userModel.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { responseHandler } from "../utils/responseHandler.js";

export const getUserEvents = responseHandler(async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const today = new Date();
    // const oneDaysLater = new Date(today.setDate(today.getDate() + 1))
    const events = await Event.find({
      $or: [{ organiser: userId }, { attendees: { $in: [userId] } }],
    })
      .populate("organiser", "name")
      .populate("attendees", "name");
      const eventsWithFlags = events
      .filter((event) => {
        if (event.date>=today) {
          // console.log(event.date);
          return event;
        }
      })
      .map((event) => {
        return {
          ...event.toObject(),
          role: event.organiser._id.toString() === userId ? "organizer" : "rsvp",
        };
      });
    let user = await User.findOne({
      _id: userId,
    }).select("-refreshToken -password");
    res.status(200).json({
      message: "user events fetched successfully",
      user:user,
      events: eventsWithFlags,
    });
  } catch (error) {
    throw new ErrorHandler(
      error.status || 500,
      error.message || "can't fetch user events right now"
    );
  }
});

export const getRsvpEvent = responseHandler(async (req, res, next) => {
  try {
    // console.log(req);
    const eventId = req.params.id;
    console.log(eventId);
    const userId = req.user.userId;
    const event = await Event.findById(eventId);
    if (!event) {
      throw new ErrorHandler(400, "event not found");
    }
    if (event.attendees.includes(userId)) {
      res
        .status(400)
        .json({ message: "You have already RSVPed to this event" });
    }
    event.attendees.push(userId);
    await event.save();
    await User.findByIdAndUpdate(
      userId,
      { $push: { events: event._id } },
      { new: true }
    );
    res.status(200).json({ message: "rsvp successful", event: event });
  } catch (error) {
    throw new ErrorHandler(
      error.status || 500,
      error.message || "can't rsvp event right now"
    );
  }
});

export const getCancelRsvpEvent = responseHandler(async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.userId;
    const event = await Event.findById(eventId);
    if (!event) {
      throw new ErrorHandler(400, "event not found");
    }
    if (!event.attendees.includes(userId)) {
      throw new ErrorHandler(400, "you are not attending this event");
    }
    event.attendees.pull(userId);
    await event.save();
    await User.findByIdAndUpdate(
      userId,
      { $pull: { events: event._id } },
      { new: true }
    );
    res.status(200).json({ message: "rsvp cancelled", event: event });
  } catch (error) {
    throw new ErrorHandler(
      error.status || 500,
      error.message || "can't cancel rsvp event right now"
    );
  }
});

export const getAttendees = responseHandler(async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.userId;
    const event = await Event.findById(eventId).populate("attendees");
    if (!event) {
      throw new ErrorHandler(400, "event not found");
    }
    if (event.organiser.toString() !== userId) {
      throw new ErrorHandler(
        400,
        "you are not authorized to access attendees of this event"
      );
    }
    res.status(200).json({
      message: "attendees fetched successfully",
      attendees: event.attendees,
    });
  } catch (error) {
    throw new ErrorHandler(
      error.status || 500,
      error.message || "can't get attendees list right now right now"
    );
  }
});
