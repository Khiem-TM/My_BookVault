package com.khiem.order.controller;

import com.khiem.order.dto.OrderDto;
import com.khiem.order.service.OrderService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
public class OrderController {
    private final OrderService service;
    public OrderController(OrderService service) { this.service = service; }

    @GetMapping("/by-user/{userId}")
    public List<OrderDto> byUser(@PathVariable Long userId) { return service.byUser(userId); }

    @PostMapping
    public ResponseEntity<OrderDto> create(@Valid @RequestBody OrderDto dto) { return ResponseEntity.ok(service.create(dto)); }

    @PostMapping("/{id}/paid")
    public ResponseEntity<OrderDto> paid(@PathVariable Long id) { return ResponseEntity.ok(service.markPaid(id)); }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<OrderDto> cancel(@PathVariable Long id) { return ResponseEntity.ok(service.cancel(id)); }
}

