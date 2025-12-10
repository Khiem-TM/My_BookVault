package com.khiem.order.controller;

import com.khiem.order.dto.OrderDto;
import com.khiem.order.entity.Order.OrderType;
import com.khiem.order.service.OrderService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService service;

    /**
     * GET /orders/by-user/{userId} - Lấy tất cả orders của user
     */
    @GetMapping("/by-user/{userId}")
    public List<OrderDto> byUser(@PathVariable Long userId) {
        return service.byUser(userId);
    }

    /**
     * GET /orders/rentals/by-user/{userId} - Lấy tất cả rental orders của user
     */
    @GetMapping("/rentals/by-user/{userId}")
    public List<OrderDto> getRentalsByUser(@PathVariable Long userId) {
        return service.getRentalsByUser(userId);
    }

    /**
     * GET /orders/{id} - Lấy chi tiết một order
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getOrderDetail(@PathVariable Long id) {
        return ResponseEntity.ok(service.getOrderDetail(id));
    }

    /**
     * POST /orders/purchase - Tạo order mua sách
     */
    @PostMapping("/purchase")
    public ResponseEntity<OrderDto> createPurchaseOrder(@Valid @RequestBody OrderDto dto) {
        dto.setOrderType(OrderType.BUY);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.createPurchaseOrder(dto));
    }

    /**
     * POST /orders/rent - Tạo order thuê sách
     */
    @PostMapping("/rent")
    public ResponseEntity<OrderDto> createRentalOrder(@Valid @RequestBody OrderDto dto) {
        dto.setOrderType(OrderType.RENT);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.createRentalOrder(dto));
    }

    /**
     * POST /orders/{id}/paid - Đánh dấu order đã thanh toán
     */
    @PostMapping("/{id}/paid")
    public ResponseEntity<OrderDto> markPaid(@PathVariable Long id) {
        return ResponseEntity.ok(service.markPaid(id));
    }

    /**
     * POST /orders/{id}/cancel - Hủy order
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<OrderDto> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(service.cancel(id));
    }

    /**
     * POST /orders/{id}/return - Đánh dấu rental order đã trả sách
     */
    @PostMapping("/{id}/return")
    public ResponseEntity<OrderDto> markReturned(@PathVariable Long id) {
        return ResponseEntity.ok(service.markReturned(id));
    }

    /**
     * POST /orders/check-overdue - Kiểm tra rental quá hạn (admin only)
     */
    @PostMapping("/check-overdue")
    public ResponseEntity<String> checkOverdueRentals() {
        service.checkOverdueRentals();
        return ResponseEntity.ok("Overdue rentals checked");
    }
}

