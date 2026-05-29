package com.kickscontrol.backend.service;

import com.kickscontrol.backend.dto.request.ProductRequestDto;
import com.kickscontrol.backend.dto.request.StockAdjustmentDto;
import com.kickscontrol.backend.dto.request.VariantRequestDto;
import com.kickscontrol.backend.dto.response.ProductResponseDto;
import com.kickscontrol.backend.dto.response.VariantResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface ProductService {
    Page<ProductResponseDto> findAll(String brand, String gender, String category,
                                     BigDecimal minPrice, BigDecimal maxPrice,
                                     String size, Boolean inStock, Pageable pageable);

    ProductResponseDto findById(Long id);

    List<String> findBrands();

    List<String> findCategories();

    // Admin
    ProductResponseDto create(ProductRequestDto dto);

    ProductResponseDto update(Long id, ProductRequestDto dto);

    void delete(Long id);

    VariantResponseDto addVariant(Long productId, VariantRequestDto dto);

    VariantResponseDto updateVariant(Long variantId, VariantRequestDto dto);

    VariantResponseDto adjustStock(Long variantId, StockAdjustmentDto dto);

    List<VariantResponseDto> getLowStockVariants(int threshold);
}
