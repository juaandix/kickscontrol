package com.kickscontrol.backend.controller;

import com.kickscontrol.backend.dto.response.*;
import com.kickscontrol.backend.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','SHIFT_LEADER')")
@Tag(name = "Admin - Analytics", description = "KPI dashboard endpoints for store managers")
@SecurityRequirement(name = "bearerAuth")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    @Operation(summary = "KPI summary: revenue, orders, avg ticket, sell-through rate, days of coverage")
    public ResponseEntity<ApiResponse<KpiSummaryDto>> getSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getSummary(from, to)));
    }

    @GetMapping("/revenue-chart")
    @Operation(summary = "Revenue time series for line chart (granularity: day | week | month)")
    public ResponseEntity<ApiResponse<List<RevenueDataPointDto>>> getRevenueChart(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "day") String granularity) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getRevenueChart(from, to, granularity)));
    }

    @GetMapping("/top-sellers")
    @Operation(summary = "Top products by revenue in the given period")
    public ResponseEntity<ApiResponse<List<TopSellerDto>>> getTopSellers(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getTopSellers(from, to, limit)));
    }

    @GetMapping("/orders-by-status")
    @Operation(summary = "Order count grouped by status for donut chart")
    public ResponseEntity<ApiResponse<List<OrderStatusCountDto>>> getOrdersByStatus() {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getOrdersByStatus()));
    }
}
