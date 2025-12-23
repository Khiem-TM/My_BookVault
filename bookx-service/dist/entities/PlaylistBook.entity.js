"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaylistBook = void 0;
const typeorm_1 = require("typeorm");
const Playlist_entity_1 = require("./Playlist.entity");
const Book_entity_1 = require("./Book.entity");
let PlaylistBook = class PlaylistBook {
};
exports.PlaylistBook = PlaylistBook;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: "bigint" }),
    __metadata("design:type", Number)
], PlaylistBook.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "bigint" }),
    __metadata("design:type", Number)
], PlaylistBook.prototype, "playlistId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "bigint" }),
    __metadata("design:type", Number)
], PlaylistBook.prototype, "bookId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Playlist_entity_1.Playlist, playlist => playlist.books, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "playlistId" }),
    __metadata("design:type", Playlist_entity_1.Playlist)
], PlaylistBook.prototype, "playlist", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Book_entity_1.Book, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "bookId" }),
    __metadata("design:type", Book_entity_1.Book)
], PlaylistBook.prototype, "book", void 0);
__decorate([
    (0, typeorm_1.Column)("int"),
    __metadata("design:type", Number)
], PlaylistBook.prototype, "position", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PlaylistBook.prototype, "addedAt", void 0);
exports.PlaylistBook = PlaylistBook = __decorate([
    (0, typeorm_1.Entity)("playlist_books")
], PlaylistBook);
