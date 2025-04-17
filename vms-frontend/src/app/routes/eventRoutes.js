// routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth'); // Your authentication middleware
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User'); // Assuming volunteers are users

// GET /api/events/:eventId/registrations
// Returns volunteers registered for a specific event
router.get('/:eventId/registrations', authMiddleware, async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const userId = req.user.id; // Get logged-in user ID from auth middleware

        // 1. Find the event
        const event = await Event.findByPk(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // 2. Authorization Check: Is the logged-in user the organizer?
        //    (Adjust 'organizerId' based on your Event model's field name)
        if (event.organizerId !== userId) {
             // You might also allow admins here based on req.user.role
            return res.status(403).json({ message: 'Forbidden: You are not the organizer of this event' });
        }

        // 3. Find registrations for this event and include volunteer details
        const registrations = await Registration.findAll({
            where: { eventId: eventId },
            include: [{
                model: User, // Join with User table
                as: 'volunteer', // Assuming you defined an alias in your model association
                attributes: ['id', 'name', 'email', 'phoneNumber', 'skills'] // Select only needed fields
                // Make sure 'skills' and 'phoneNumber' are actually on your User/Volunteer model
            }]
        });

        // 4. Extract volunteer data from registrations
        const volunteers = registrations.map(reg => reg.volunteer).filter(v => v != null); // Filter out potential nulls

        res.json(volunteers); // Return the list of volunteers

    } catch (error) {
        console.error("Error fetching event registrations:", error);
        res.status(500).json({ message: 'Server error fetching registrations' });
    }
});

module.exports = router;