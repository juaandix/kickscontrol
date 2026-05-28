package com.kickscontrol.backend.service.impl;

import com.kickscontrol.backend.dto.request.ProductRequestDto;
import com.kickscontrol.backend.dto.request.StockAdjustmentDto;
import com.kickscontrol.backend.dto.request.VariantRequestDto;
import com.kickscontrol.backend.dto.response.ProductResponseDto;
import com.kickscontrol.backend.dto.response.VariantResponseDto;
import com.kickscontrol.backend.entity.Product;
import com.kickscontrol.backend.entity.ProductVariant;
import com.kickscontrol.backend.exception.BusinessException;
import com.kickscontrol.backend.exception.ResourceNotFoundException;
import com.kickscontrol.backend.repository.ProductRepository;
import com.kickscontrol.backend.repository.ProductSpecification;
import com.kickscontrol.backend.repository.ProductVariantRepository;
import com.kickscontrol.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponseDto> findAll(String brand, String gender, String category,
                                            BigDecimal minPrice, BigDecimal maxPrice,
                                            String size, Boolean inStock, Pageable pageable) {
        Specification<Product> spec = ProductSpecification.withFilters(
                brand, gender, category, minPrice, maxPrice, size, inStock
        );
        return productRepository.findAll(spec, pageable)
                .map(ProductResponseDto::summary);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponseDto findById(Long id) {
        Product product = productRepository.findById(id)
                .filter(p -> Boolean.TRUE.equals(p.getIsActive()))
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return ProductResponseDto.from(product);
    }

    @Override
    public List<String> findBrands() {
        return productRepository.findDistinctBrands();
    }

    @Override
    public List<String> findCategories() {
        return productRepository.findDistinctCategories();
    }

    @Override
    @Transactional
    public ProductResponseDto create(ProductRequestDto dto) {
        Product product = Product.builder()
                .name(dto.getName())
                .brand(dto.getBrand())
                .description(dto.getDescription())
                .gender(dto.getGender())
                .category(dto.getCategory())
                .basePrice(dto.getBasePrice())
                .imageUrl(dto.getImageUrl())
                .build();

        if (dto.getVariants() != null) {
            for (VariantRequestDto vDto : dto.getVariants()) {
                validateSkuUnique(vDto.getSku(), null);
                ProductVariant variant = buildVariant(vDto, product);
                product.getVariants().add(variant);
            }
        }

        return ProductResponseDto.from(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponseDto update(Long id, ProductRequestDto dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        product.setName(dto.getName());
        product.setBrand(dto.getBrand());
        product.setDescription(dto.getDescription());
        product.setGender(dto.getGender());
        product.setCategory(dto.getCategory());
        product.setBasePrice(dto.getBasePrice());
        product.setImageUrl(dto.getImageUrl());

        return ProductResponseDto.from(productRepository.save(product));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        product.setIsActive(false);
        productRepository.save(product);
    }

    @Override
    @Transactional
    public VariantResponseDto addVariant(Long productId, VariantRequestDto dto) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        validateSkuUnique(dto.getSku(), null);
        ProductVariant variant = buildVariant(dto, product);
        return VariantResponseDto.from(variantRepository.save(variant));
    }

    @Override
    @Transactional
    public VariantResponseDto updateVariant(Long variantId, VariantRequestDto dto) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Variant", "id", variantId));

        if (!variant.getSku().equals(dto.getSku())) {
            validateSkuUnique(dto.getSku(), variantId);
        }

        variant.setSize(dto.getSize());
        variant.setColor(dto.getColor());
        variant.setSku(dto.getSku());
        variant.setStockQuantity(dto.getStockQuantity());
        variant.setPriceModifier(dto.getPriceModifier() != null ? dto.getPriceModifier() : BigDecimal.ZERO);
        variant.setImageUrl(dto.getImageUrl());

        return VariantResponseDto.from(variantRepository.save(variant));
    }

    @Override
    @Transactional
    public VariantResponseDto adjustStock(Long variantId, StockAdjustmentDto dto) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Variant", "id", variantId));

        int newStock = variant.getStockQuantity() + dto.getDelta();
        if (newStock < 0) {
            throw new BusinessException(
                    String.format("Stock adjustment would result in negative stock for SKU '%s'. Current: %d, Delta: %d",
                            variant.getSku(), variant.getStockQuantity(), dto.getDelta())
            );
        }

        log.info("Stock adjustment — SKU: {}, delta: {}, reason: {}, old: {}, new: {}",
                variant.getSku(), dto.getDelta(), dto.getReason(), variant.getStockQuantity(), newStock);

        variant.setStockQuantity(newStock);
        return VariantResponseDto.from(variantRepository.save(variant));
    }

    @Override
    @Transactional(readOnly = true)
    public List<VariantResponseDto> getLowStockVariants(int threshold) {
        return variantRepository.findLowStockVariants(threshold)
                .stream()
                .map(VariantResponseDto::from)
                .toList();
    }

    private ProductVariant buildVariant(VariantRequestDto dto, Product product) {
        return ProductVariant.builder()
                .product(product)
                .size(dto.getSize())
                .color(dto.getColor())
                .sku(dto.getSku())
                .stockQuantity(dto.getStockQuantity())
                .priceModifier(dto.getPriceModifier() != null ? dto.getPriceModifier() : BigDecimal.ZERO)
                .imageUrl(dto.getImageUrl())
                .build();
    }

    private void validateSkuUnique(String sku, Long excludeVariantId) {
        variantRepository.findBySku(sku).ifPresent(existing -> {
            if (excludeVariantId == null || !existing.getId().equals(excludeVariantId)) {
                throw new BusinessException("SKU already exists: " + sku);
            }
        });
    }
}
