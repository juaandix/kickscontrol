package com.kickscontrol.backend.controller;

import com.kickscontrol.backend.dto.request.StoreSaleRequest;
import com.kickscontrol.backend.dto.response.ApiResponse;
import com.kickscontrol.backend.dto.response.OrderResponseDto;
import com.kickscontrol.backend.dto.response.StoreVariantLookupDto;
import com.kickscontrol.backend.entity.User;
import com.kickscontrol.backend.service.OrderService;
import com.kickscontrol.backend.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/store")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','SHIFT_LEADER')")
@Tag(name = "Store", description = "Physical store: till, SKU lookup")
@SecurityRequirement(name = "bearerAuth")
public class StoreController {

    private final OrderService orderService;
    private final ProductService productService;

    @PostMapping("/sales")
    @Operation(summary = "Ring up a sale at the till (same stock and locking as the online checkout)")
    public ResponseEntity<ApiResponse<OrderResponseDto>> sell(
            @AuthenticationPrincipal User staff,
            @Valid @RequestBody StoreSaleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Sale completed", orderService.storeSale(staff, request)));
    }

    @GetMapping("/sales/today")
    @Operation(summary = "Today's till sales, newest first")
    public ResponseEntity<ApiResponse<List<OrderResponseDto>>> today() {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getStoreSalesSince(LocalDate.now().atStartOfDay())));
    }

    @GetMapping("/variants/{sku}")
    @Operation(summary = "Find a box by its SKU (barcode scan)")
    public ResponseEntity<ApiResponse<StoreVariantLookupDto>> lookup(@PathVariable String sku) {
        return ResponseEntity.ok(ApiResponse.ok(productService.findBySku(sku)));
    }
}
