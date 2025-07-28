import express from 'express';
import protect from '../middleware/auth.js';
import {
  createRoom,
  getAllRooms,
  joinRoom,
  getRoomMessages,
  sendRoomMessage,
  deleteRoom,
  getMyRooms
} from '../controll/roomController.js';

const router = express.Router();

router.post("/create", protect, createRoom);
router.get("/all", protect, getAllRooms);
router.post("/join/:roomId", protect, joinRoom);
router.get("/:roomId/messages", protect, getRoomMessages);
router.post("/:roomId/messages", protect, sendRoomMessage);
router.get("/getRooms",protect, getMyRooms)
router.delete("/:roomId", deleteRoom);

export default router;
