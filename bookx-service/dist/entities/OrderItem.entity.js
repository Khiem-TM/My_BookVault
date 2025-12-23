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
exports.OrderItem = exports.ItemType = void 0;
const typeorm_1 = require("typeorm");
const Order_entity_1 = require("./Order.entity");
const Book_entity_1 = require("./Book.entity");
var ItemType;
(function (ItemType) {
    ItemType["FREE"] = "FREE";
    ItemType["PAID"] = "PAID";
})(ItemType || (exports.ItemType = ItemType = {}));
let OrderItem = class OrderItem {
};
exports.OrderItem = OrderItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: "bigint" }),
    __metadata("design:type", Number)
], OrderItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "bigint" }),
    __metadata("design:type", Number)
], OrderItem.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "bigint" }),
    __metadata("design:type", Number)
], OrderItem.prototype, "bookId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ItemType,
        default: ItemType.PAID
    }),
    __metadata("design:type", String)
], OrderItem.prototype, "bookType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], OrderItem.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Order_entity_1.Order, order => order.items),
    (0, typeorm_1.JoinColumn)({ name: "orderId" }),
    __metadata("design:type", Order_entity_1.Order)
], OrderItem.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Book_entity_1.Book),
    (0, typeorm_1.JoinColumn)({ name: "bookId" }),
    __metadata("design:type", Book_entity_1.Book)
], OrderItem.prototype, "book", void 0);
exports.OrderItem = OrderItem = __decorate([
    (0, typeorm_1.Entity)("order_items")
], OrderItem);
