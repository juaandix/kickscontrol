package com.kickscontrol.backend.repository;

import com.kickscontrol.backend.entity.Product;
import com.kickscontrol.backend.entity.ProductVariant;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> withFilters(
            String brand,
            String gender,
            String category,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String size,
            Boolean inStock
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Siempre solo productos activos
            predicates.add(cb.isTrue(root.get("isActive")));

            if (brand != null && !brand.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("brand")), brand.toLowerCase()));
            }
            if (gender != null && !gender.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("gender")), gender.toLowerCase()));
            }
            if (category != null && !category.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("category")), category.toLowerCase()));
            }
            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("basePrice"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("basePrice"), maxPrice));
            }

            // Filtros sobre variantes — requieren subquery para evitar duplicados
            if (size != null && !size.isBlank()) {
                Subquery<Long> subquery = query.subquery(Long.class);
                Root<ProductVariant> variantRoot = subquery.from(ProductVariant.class);
                subquery.select(variantRoot.get("product").get("id"))
                        .where(
                                cb.equal(variantRoot.get("product"), root),
                                cb.equal(variantRoot.get("size"), size),
                                cb.isTrue(variantRoot.get("isActive"))
                        );
                predicates.add(cb.exists(subquery));
            }

            if (Boolean.TRUE.equals(inStock)) {
                Subquery<Long> subquery = query.subquery(Long.class);
                Root<ProductVariant> variantRoot = subquery.from(ProductVariant.class);
                subquery.select(variantRoot.get("product").get("id"))
                        .where(
                                cb.equal(variantRoot.get("product"), root),
                                cb.greaterThan(variantRoot.get("stockQuantity"), 0),
                                cb.isTrue(variantRoot.get("isActive"))
                        );
                predicates.add(cb.exists(subquery));
            }

            query.distinct(true);
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
