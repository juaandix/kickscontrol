package com.kickscontrol.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class KpiSummaryDto {
    private BigDecimal totalRevenue;
    private Long totalOrders;
    private BigDecimal avgTicket;
    private Long totalUnitsSold;
    private Integer lowStockAlerts;

    // Retail-specific KPIs
    private BigDecimal sellThroughRate;    // unidades vendidas / (vendidas + stock actual) %
    private Double avgDaysOfCoverage;      // stock actual / promedio ventas diarias
    private BigDecimal shrinkageRate;      // unidades perdidas por ajuste negativo / total movimientos %
}
