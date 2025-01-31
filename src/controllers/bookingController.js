const Booking = require("../models/Booking");
const Event = require("../models/Event");

const bookingController = {
  // Create booking
  createBooking: async (req, res) => {
    try {
      const { eventId, seats } = req.body;
      const userId = req.user.userId;

      // Check if event exists and has enough seats
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event tidak ditemukan" });
      }

      if (event.availableSeats < seats) {
        return res.status(400).json({ message: "Kursi tidak mencukupi" });
      }

      // Create booking
      const booking = new Booking({
        eventId,
        userId,
        seats,
      });

      // Update available seats
      event.availableSeats -= seats;
      await event.save();
      await booking.save();

      res.status(201).json(booking);
    } catch (error) {
      res.status(500).json({ message: "Plan with Senja: Server error" });
    }
  },

  // Get user bookings
  getUserBookings: async (req, res) => {
    try {
      const userId = req.user.userId;
      const bookings = await Booking.find({ userId })
        .populate("eventId")
        .sort({ bookingDate: -1 });
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  },

  // Cancel booking
  cancelBooking: async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        return res.status(404).json({ message: "Booking tidak ditemukan" });
      }

      // Check if user owns the booking
      if (booking.userId.toString() !== req.user.userId) {
        return res.status(403).json({ message: "Tidak diizinkan" });
      }

      // Return seats to event
      const event = await Event.findById(booking.eventId);
      if (!event) {
        return res.status(404).json({ message: "Event tidak ditemukan" });
      }
      
      event.availableSeats += booking.seats;
      await event.save();
      await Booking.deleteOne({ _id: req.params.id });
      res.json({ message: "Booking berhasil dibatalkan" });
    } catch (error) {
      console.error('Error canceling booking:', error);
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  },
};

module.exports = bookingController;
