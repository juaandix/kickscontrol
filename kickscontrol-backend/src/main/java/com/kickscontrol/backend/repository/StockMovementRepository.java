package com.kickscontrol.backend.repository;

import com.kickscontrol.backend.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    @Query("SELECT m FROM StockMovement m LEFT JOIN FETCH m.user WHERE m.variant.id = :variantId ORDER BY m.createdAt DESC, m.id DESC LIMIT 20")
    List<StockMovement> findRecentByVariantId(@Param("variantId") Long variantId);
}
