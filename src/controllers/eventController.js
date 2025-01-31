const Event = require("../models/Event");

const eventController = {
  // Create event
  createEvent: async (req, res) => {
    try {
      const { title, description, date, availableSeats } = req.body;

      // Validate date is in future
      if (new Date(date) < new Date()) {
        return res
          .status(400)
          .json({ message: "Tanggal event harus di masa depan" });
      }

      // Validate seats
      if (availableSeats <= 0) {
        return res
          .status(400)
          .json({ message: "Jumlah kursi harus lebih dari 0" });
      }

      const event = new Event({
        title,
        description,
        date,
        availableSeats,
      });

      await event.save();
      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ message: "Plan with Senja: Server error" });
    }
  },

  // Get all events
  getEvents: async (req, res) => {
    try {
      const { startDate, endDate, page = 1 } = req.query;
      const limit = 6;
      let query = {};

      if (startDate || endDate) {
        // Add date validation
        const isValidStartDate = startDate ? !isNaN(new Date(startDate).getTime()) : true;
        const isValidEndDate = endDate ? !isNaN(new Date(endDate).getTime()) : true;
        
        if (!isValidStartDate || !isValidEndDate) {
          return res.status(400).json({ 
            message: "Format tanggal tidak valid. Gunakan format YYYY-MM-DD" 
          });
        }

        query.date = {};
        
        if (startDate) {
          const start = new Date(startDate);
          query.date.$gte = new Date(start.setHours(0, 0, 0));
        }
        
        if (endDate) {
          const end = new Date(endDate);
          query.date.$lte = new Date(end.setHours(23, 59, 59));
        }
      }

      // Calculate skip value for pagination
      const skip = (page - 1) * limit;

      // Get total count for pagination info
      const totalEvents = await Event.countDocuments(query);
      const totalPages = Math.ceil(totalEvents / limit);

      // Get paginated events
      const events = await Event.find(query)
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit);

      res.json({
        events,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalEvents,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Plan with Senja: Server error" });
    }
  },

  // Get event detail by ID
  getEventDetail: async (req, res) => {
    try {
      const eventId = req.params.id;

      const event = await Event.findById(eventId);
      
      if (!event) {
        return res.status(404).json({ 
          message: "Event tidak ditemukan" 
        });
      }

      res.json(event);
    } catch (error) {
      if (error.kind === 'ObjectId') {
        return res.status(400).json({ 
          message: "ID Event tidak valid" 
        });
      }
      res.status(500).json({ message: "Plan with Senja: Server error" });
    }
  },
};

module.exports = eventController;
