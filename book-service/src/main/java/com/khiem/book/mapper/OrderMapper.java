package com.khiem.book.mapper;

import com.khiem.book.dto.OrderDto;
import com.khiem.book.entity.Order;
import org.springframework.stereotype.Component;

@Component
public class OrderMapper {

    public OrderDto toDto(Order entity) {
        if (entity == null) return null;

        return OrderDto.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .bookId(entity.getBookId())
                .orderType(entity.getOrderType())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .rentalStartDate(entity.getRentalStartDate())
                .rentalEndDate(entity.getRentalEndDate())
                .rentalDays(entity.getRentalDays())
                .rentalPrice(entity.getRentalPrice())
                .paymentMethod(entity.getPaymentMethod())
                .totalPrice(entity.getTotalPrice())
                .notes(entity.getNotes())
                .build();
    }

    public Order toEntity(OrderDto dto) {
        if (dto == null) return null;

        Order entity = new Order();
        entity.setId(dto.getId());
        entity.setUserId(dto.getUserId());
        entity.setBookId(dto.getBookId());
        entity.setOrderType(dto.getOrderType());
        entity.setStatus(dto.getStatus() != null ? dto.getStatus() : Order.Status.PENDING);
        entity.setRentalStartDate(dto.getRentalStartDate());
        entity.setRentalEndDate(dto.getRentalEndDate());
        entity.setRentalDays(dto.getRentalDays());
        entity.setRentalPrice(dto.getRentalPrice());
        entity.setPaymentMethod(dto.getPaymentMethod());
        entity.setTotalPrice(dto.getTotalPrice());
        entity.setNotes(dto.getNotes());
        return entity;
    }
}
