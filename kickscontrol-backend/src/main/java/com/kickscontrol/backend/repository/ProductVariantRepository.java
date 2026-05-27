package com.kickscontrol.backend.repository;

import com.kickscontrol.backend.entity.ProductVariant;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    List<ProductVariant> findByProductIdAndIsActiveTrue(Long productId);

    Optional<ProductVariant> findBySku(String sku);

    // Pessimistic lock para el flujo de checkout — garantiza orden en actualizaciones de stock
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT v FROM ProductVariant v WHERE v.id = :id")
    Optional<ProductVariant> findByIdForUpdate(@Param("id") Long id);

    @Query("SELECT v FROM ProductVariant v WHERE v.stockQuantity <= :threshold AND v.isActive = true")
    List<ProductVariant> findLowStockVariants(@Param("threshold") int threshold);
}
