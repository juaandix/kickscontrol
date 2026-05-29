package com.kickscontrol.backend.service;

import com.kickscontrol.backend.dto.response.*;

import java.time.LocalDate;
import java.util.List;

public interface AnalyticsService {
    KpiSummaryDto getSummary(LocalDate from, LocalDate to);
    List<RevenueDataPointDto> getRevenueChart(LocalDate from, LocalDate to, String granularity);
    List<TopSellerDto> getTopSellers(LocalDate from, LocalDate to, int limit);
    List<OrderStatusCountDto> getOrdersByStatus();
}
