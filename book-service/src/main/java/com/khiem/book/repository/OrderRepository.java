package com.khiem.book.repository;

import com.khiem.book.entity.Order;
import com.khiem.book.entity.Order.OrderType;
import com.khiem.book.entity.Order.Status;
import java.time.LocalDate;
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
    
    @Query("SELECT o FROM Order o WHERE o.orderType = 'RENT' AND o.status = 'PAID' AND o.rentalEndDate < ?1")
    List<Order> findExpiredRentals(LocalDate date);
    
    @Query("SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END FROM Order o WHERE o.userId = ?1 AND o.bookId = ?2 AND o.status IN ('PAID', 'RETURNED')")
    boolean hasUserBorrowedOrRentedBook(Long userId, Long bookId);
}

