import { Event, Message } from "../models/index.js";
import { reportResultToContract } from "../services/oracle.service.js";

// GET /api/events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.findAll();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/events/:id
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [Message]
    });
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/events
// Admin only
export const createEvent = async (req, res) => {
  try {
    const { title, description, team_a, team_b, image, deadline, contract_event_id } = req.body;
    const newEvent = await Event.create({
      title, description, team_a, team_b, image, deadline, contract_event_id
    });
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/result
// Admin only. Acts as an oracle trigger.
export const submitResult = async (req, res) => {
  try {
    const { event_id, result } = req.body; // event_id here is DB ID, result is boolean
    
    const event = await Event.findByPk(event_id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    // Step 1: Submit to blockchain using Oracle
    await reportResultToContract(event.contract_event_id, result);

    // Step 2: Update database
    event.status = "completed";
    await event.save();

    res.json({ success: true, message: "Result submitted to blockchain successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
