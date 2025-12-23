"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PlaylistController_1 = require("../controllers/PlaylistController");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const playlistController = new PlaylistController_1.PlaylistController();
// Create a new playlist
router.post("/", auth_middleware_1.authenticateJWT, (req, res) => playlistController.createPlaylist(req, res));
router.post("/playlists", auth_middleware_1.authenticateJWT, (req, res) => playlistController.createPlaylist(req, res));
// Add a book to a playlist
router.post("/:id/books", auth_middleware_1.authenticateJWT, (req, res) => playlistController.addBook(req, res));
router.post("/playlists/:id/books", auth_middleware_1.authenticateJWT, (req, res) => playlistController.addBook(req, res));
// Client uses this structure for adding book with bookId in params
router.post("/playlists/:id/books/:bookId", auth_middleware_1.authenticateJWT, (req, res) => playlistController.addBook(req, res));
// Remove a book from a playlist
router.delete("/:id/books/:bookId", auth_middleware_1.authenticateJWT, (req, res) => playlistController.removeBook(req, res));
router.delete("/playlists/:id/books/:bookId", auth_middleware_1.authenticateJWT, (req, res) => playlistController.removeBook(req, res));
// Get my playlists
router.get("/my", auth_middleware_1.authenticateJWT, (req, res) => playlistController.getMyPlaylists(req, res));
router.get("/playlists", auth_middleware_1.authenticateJWT, (req, res) => playlistController.getMyPlaylists(req, res));
// Get my books (all personal)
router.get("/my-books", auth_middleware_1.authenticateJWT, (req, res) => playlistController.getMyBooks(req, res));
router.get("/playlists/my-books", auth_middleware_1.authenticateJWT, (req, res) => playlistController.getMyBooks(req, res));
// Get a specific playlist (Put this last to avoid collision)
router.get("/:id", (req, res) => playlistController.getPlaylistById(req, res));
router.get("/playlists/:id", (req, res) => playlistController.getPlaylistById(req, res));
exports.default = router;
