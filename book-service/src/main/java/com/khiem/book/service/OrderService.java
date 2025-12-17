package com.khiem.book.service;

import com.khiem.book.dto.OrderDto;
import com.khiem.book.entity.Order;
import com.khiem.book.entity.Order.Status;
import com.khiem.book.entity.Order.OrderType;
import com.khiem.book.mapper.OrderMapper;
import com.khiem.book.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    private final OrderRepository repository;
    private final OrderMapper orderMapper;

    /**
     * Lấy tất cả orders của user
     */
    @Transactional(readOnly = true)
    public List<OrderDto> byUser(Long userId) {
        log.info("Fetching orders for user: {}", userId);
        return repository.findByUserId(userId).stream()
                .map(orderMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Lấy tất cả rental orders của user
     */
    @Transactional(readOnly = true)
    public List<OrderDto> getRentalsByUser(Long userId) {
        log.info("Fetching rental orders for user: {}", userId);
        return repository.findByUserIdAndOrderType(userId, OrderType.RENT).stream()
                .map(orderMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Lấy chi tiết một order
     */
    @Transactional(readOnly = true)
    public OrderDto getOrderDetail(Long orderId) {
        log.info("Fetching order detail: {}", orderId);
        return repository.findById(orderId)
                .map(orderMapper::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
    }

    /**
     * Tạo order mua sách
     */
    @Transactional
    public OrderDto createPurchaseOrder(OrderDto dto) {
        log.info("Creating purchase order for user {} book {}", dto.getUserId(), dto.getBookId());
        
        Order order = new Order(dto.getUserId(), dto.getBookId(), OrderType.BUY);
        order.setStatus(Status.PENDING);
        order.setTotalPrice(dto.getTotalPrice());
        order.setPaymentMethod(dto.getPaymentMethod());
        order.setCreatedAt(Instant.now());
        order.setUpdatedAt(Instant.now());
        
        Order saved = repository.save(order);
        log.info("Purchase order created with id: {}", saved.getId());
        return orderMapper.toDto(saved);
    }

    /**
     * Tạo order thuê sách (rental)
     */
    @Transactional
    public OrderDto createRentalOrder(OrderDto dto) {
        log.info("Creating rental order for user {} book {}", dto.getUserId(), dto.getBookId());
        
        if (dto.getRentalStartDate() == null || dto.getRentalDays() == null) {
            throw new IllegalArgumentException("Rental start date and rental days are required");
        }
        
        Order order = new Order(dto.getUserId(), dto.getBookId(), OrderType.RENT);
        order.setStatus(Status.PENDING);
        order.setRentalStartDate(dto.getRentalStartDate());
        order.setRentalDays(dto.getRentalDays());
        order.setRentalEndDate(dto.getRentalStartDate().plusDays(dto.getRentalDays()));
        order.setRentalPrice(dto.getRentalPrice());
        order.setTotalPrice(dto.getTotalPrice());
        order.setPaymentMethod(dto.getPaymentMethod());
        order.setNotes(dto.getNotes());
        order.setCreatedAt(Instant.now());
        order.setUpdatedAt(Instant.now());
        
        Order saved = repository.save(order);
        log.info("Rental order created with id: {}", saved.getId());
        return orderMapper.toDto(saved);
    }

    /**
     * Đánh dấu order đã thanh toán
     */
    @Transactional
    public OrderDto markPaid(Long id) {
        log.info("Marking order {} as paid", id);
        Order order = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        
        order.setStatus(Status.PAID);
        order.setUpdatedAt(Instant.now());
        Order saved = repository.save(order);
        
        log.info("Order {} marked as paid", id);
        return orderMapper.toDto(saved);
    }

    /**
     * Hủy order
     */
    @Transactional
    public OrderDto cancel(Long id) {
        log.info("Cancelling order {}", id);
        Order order = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        
        if (order.getStatus() == Status.PAID) {
            throw new IllegalArgumentException("Cannot cancel paid order");
        }
        
        order.setStatus(Status.CANCELLED);
        order.setUpdatedAt(Instant.now());
        Order saved = repository.save(order);
        
        log.info("Order {} cancelled", id);
        return orderMapper.toDto(saved);
    }

    /**
     * Đánh dấu rental order đã trả sách
     */
    @Transactional
    public OrderDto markReturned(Long id) {
        log.info("Marking rental order {} as returned", id);
        Order order = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        
        if (order.getOrderType() != OrderType.RENT) {
            throw new IllegalArgumentException("Order is not a rental order");
        }
        
        order.setStatus(Status.RETURNED);
        order.setUpdatedAt(Instant.now());
        Order saved = repository.save(order);
        
        log.info("Rental order {} marked as returned", id);
        return orderMapper.toDto(saved);
    }

    /**
     * Kiểm tra và đánh dấu rental quá hạn
     */
    @Transactional
    public void checkOverdueRentals() {
        log.info("Checking for overdue rentals");
        List<Order> rentalOrders = repository.findByOrderTypeAndStatus(OrderType.RENT, Status.PAID);
        
        LocalDate today = LocalDate.now();
        for (Order order : rentalOrders) {
            if (order.getRentalEndDate() != null && order.getRentalEndDate().isBefore(today)) {
                order.setStatus(Status.OVERDUE);
                repository.save(order);
                log.info("Rental order {} marked as overdue", order.getId());
            }
        }
    }
}

