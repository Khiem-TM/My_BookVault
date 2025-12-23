import { Router } from "express";
import { PlaylistController } from "../controllers/PlaylistController";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();
const playlistController = new PlaylistController();

// Create a new playlist
router.post("/", authenticateJWT, (req, res) => playlistController.createPlaylist(req, res));
router.post("/playlists", authenticateJWT, (req, res) => playlistController.createPlaylist(req, res));

// Add a book to a playlist
router.post("/:id/books", authenticateJWT, (req, res) => playlistController.addBook(req, res));
router.post("/playlists/:id/books", authenticateJWT, (req, res) => playlistController.addBook(req, res));
// Client uses this structure for adding book with bookId in params
router.post("/playlists/:id/books/:bookId", authenticateJWT, (req, res) => playlistController.addBook(req, res));

// Remove a book from a playlist
router.delete("/:id/books/:bookId", authenticateJWT, (req, res) => playlistController.removeBook(req, res));
router.delete("/playlists/:id/books/:bookId", authenticateJWT, (req, res) => playlistController.removeBook(req, res));

// Get my playlists
router.get("/my", authenticateJWT, (req, res) => playlistController.getMyPlaylists(req, res));
router.get("/playlists", authenticateJWT, (req, res) => playlistController.getMyPlaylists(req, res));

// Get my books (all personal)
router.get("/my-books", authenticateJWT, (req, res) => playlistController.getMyBooks(req, res));
router.get("/playlists/my-books", authenticateJWT, (req, res) => playlistController.getMyBooks(req, res));

// Get a specific playlist (Put this last to avoid collision)
router.get("/:id", (req, res) => playlistController.getPlaylistById(req, res));
router.get("/playlists/:id", (req, res) => playlistController.getPlaylistById(req, res));

export default router;
