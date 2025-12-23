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
exports.Book = exports.BookStatus = exports.BookType = void 0;
const typeorm_1 = require("typeorm");
const Review_entity_1 = require("./Review.entity");
var BookType;
(function (BookType) {
    BookType["PHYSICAL_BOOK"] = "PHYSICAL_BOOK";
    BookType["EBOOK"] = "EBOOK";
    BookType["AUDIO_BOOK"] = "AUDIO_BOOK";
})(BookType || (exports.BookType = BookType = {}));
var BookStatus;
(function (BookStatus) {
    BookStatus["AVAILABLE"] = "AVAILABLE";
    BookStatus["OUT_OF_STOCK"] = "OUT_OF_STOCK";
    BookStatus["DISCONTINUED"] = "DISCONTINUED";
})(BookStatus || (exports.BookStatus = BookStatus = {}));
let Book = class Book {
};
exports.Book = Book;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: "bigint" }),
    __metadata("design:type", Number)
], Book.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Book.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Book.prototype, "author", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], Book.prototype, "isbn", void 0);
__decorate([
    (0, typeorm_1.Column)("text", { nullable: true }),
    __metadata("design:type", String)
], Book.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)("simple-array", { nullable: true }),
    __metadata("design:type", Array)
], Book.prototype, "categories", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true }),
    __metadata("design:type", Date)
], Book.prototype, "publishedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: BookType,
        default: BookType.PHYSICAL_BOOK
    }),
    __metadata("design:type", String)
], Book.prototype, "bookType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: BookStatus,
        default: BookStatus.AVAILABLE
    }),
    __metadata("design:type", String)
], Book.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], Book.prototype, "totalQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], Book.prototype, "availableQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Book.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Book.prototype, "rentalPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], Book.prototype, "rentalDurationDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Book.prototype, "publisher", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", String)
], Book.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], Book.prototype, "pageCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "double", default: 0.0 }),
    __metadata("design:type", Number)
], Book.prototype, "averageRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], Book.prototype, "ratingsCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Book.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 36, nullable: true }) // UUID string
    ,
    __metadata("design:type", String)
], Book.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 36, nullable: true }) // UUID string
    ,
    __metadata("design:type", String)
], Book.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Review_entity_1.Review, review => review.book),
    __metadata("design:type", Array)
], Book.prototype, "reviews", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Book.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Book.prototype, "updatedAt", void 0);
exports.Book = Book = __decorate([
    (0, typeorm_1.Entity)("books")
], Book);
