package com.khiem.order.repository;

import com.khiem.order.entity.Order;
import com.khiem.order.entity.Order.OrderType;
import com.khiem.order.entity.Order.Status;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    
    List<Order> findByUserIdAndOrderType(Long userId, OrderType orderType);
    
    List<Order> findByOrderTypeAndStatus(OrderType orderType, Status status);
    
    @Query("SELECT o FROM Order o WHERE o.userId = ?1 AND o.orderType = 'RENT' AND o.status IN ('PAID', 'OVERDUE')")
    List<Order> findActiveRentalsByUserId(Long userId);
}

