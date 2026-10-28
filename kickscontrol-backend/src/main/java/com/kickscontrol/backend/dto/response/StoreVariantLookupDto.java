package com.kickscontrol.backend.dto.response;

/** A scanned box: which variant it is, and its product with every size and colour on the shelf. */
public record StoreVariantLookupDto(Long variantId, ProductResponseDto product) {}
