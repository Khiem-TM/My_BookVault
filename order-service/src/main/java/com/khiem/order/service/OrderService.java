package com.khiem.order.service;

import com.khiem.order.dto.OrderDto;
import com.khiem.order.entity.Order;
import com.khiem.order.repository.OrderRepository;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class OrderService {
    private final OrderRepository repository;

    public OrderService(OrderRepository repository) { this.repository = repository; }

    public List<OrderDto> byUser(Long userId) {
        return repository.findByUserId(userId).stream().map(this::toDto).collect(Collectors.toList());
    }

    public OrderDto create(OrderDto dto) {
        Order o = toEntity(dto);
        o.setStatus(Order.Status.PENDING);
        o.setCreatedAt(Instant.now());
        return toDto(repository.save(o));
    }

    public OrderDto markPaid(Long id) {
        Order o = repository.findById(id).orElseThrow();
        o.setStatus(Order.Status.PAID);
        return toDto(repository.save(o));
    }

    public OrderDto cancel(Long id) {
        Order o = repository.findById(id).orElseThrow();
        o.setStatus(Order.Status.CANCELLED);
        return toDto(repository.save(o));
    }

    private OrderDto toDto(Order o) {
        OrderDto d = new OrderDto();
        d.setId(o.getId());
        d.setUserId(o.getUserId());
        d.setBookId(o.getBookId());
        d.setStatus(o.getStatus());
        d.setCreatedAt(o.getCreatedAt());
        return d;
    }

    private Order toEntity(OrderDto d) {
        Order o = new Order();
        o.setId(d.getId());
        o.setUserId(d.getUserId());
        o.setBookId(d.getBookId());
        o.setStatus(d.getStatus());
        o.setCreatedAt(d.getCreatedAt());
        return o;
    }
}

