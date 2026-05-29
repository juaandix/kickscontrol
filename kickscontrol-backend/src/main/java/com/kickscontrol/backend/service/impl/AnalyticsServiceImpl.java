package com.kickscontrol.backend.service.impl;

import com.kickscontrol.backend.dto.response.*;
import com.kickscontrol.backend.entity.enums.OrderStatus;
import com.kickscontrol.backend.service.AnalyticsService;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final EntityManager em;

    @Override
    @Transactional(readOnly = true)
    public KpiSummaryDto getSummary(LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();

        // Facturación y pedidos del periodo
        Object[] revenueRow = (Object[]) em.createQuery(
                "SELECT COALESCE(SUM(o.totalAmount), 0), COUNT(o) " +
                "FROM Order o WHERE o.status = :status " +
                "AND o.createdAt >= :start AND o.createdAt < :end")
                .setParameter("status", OrderStatus.CONFIRMED)
                .setParameter("start", start)
                .setParameter("end", end)
                .getSingleResult();

        BigDecimal totalRevenue = (BigDecimal) revenueRow[0];
        Long totalOrders = (Long) revenueRow[1];
        BigDecimal avgTicket = totalOrders > 0
                ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Unidades vendidas
        Long unitsSold = (Long) em.createQuery(
                "SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi " +
                "JOIN oi.order o WHERE o.status = :status " +
                "AND o.createdAt >= :start AND o.createdAt < :end")
                .setParameter("status", OrderStatus.CONFIRMED)
                .setParameter("start", start)
                .setParameter("end", end)
                .getSingleResult();

        // Stock total actual
        Long currentStock = (Long) em.createQuery(
                "SELECT COALESCE(SUM(pv.stockQuantity), 0) FROM ProductVariant pv WHERE pv.isActive = true")
                .getSingleResult();

        // Sell-Through Rate: vendidas / (vendidas + stock actual) — indica qué % del inventario rotó
        BigDecimal sellThrough = BigDecimal.ZERO;
        long denominator = unitsSold + currentStock;
        if (denominator > 0) {
            sellThrough = BigDecimal.valueOf(unitsSold * 100.0 / denominator)
                    .setScale(1, RoundingMode.HALF_UP);
        }

        // Días de cobertura: stock actual / promedio ventas diarias del periodo
        long days = Math.max(1, from.until(to, java.time.temporal.ChronoUnit.DAYS) + 1);
        double avgDailySales = unitsSold / (double) days;
        double daysOfCoverage = avgDailySales > 0
                ? Math.round((currentStock / avgDailySales) * 10.0) / 10.0
                : 0.0;

        // Alertas de stock crítico
        Long lowStockCount = (Long) em.createQuery(
                "SELECT COUNT(pv) FROM ProductVariant pv WHERE pv.stockQuantity <= 5 AND pv.isActive = true")
                .getSingleResult();

        return KpiSummaryDto.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .avgTicket(avgTicket)
                .totalUnitsSold(unitsSold)
                .lowStockAlerts(lowStockCount.intValue())
                .sellThroughRate(sellThrough)
                .avgDaysOfCoverage(daysOfCoverage)
                .shrinkageRate(BigDecimal.ZERO) // requiere log de ajustes negativos — Sprint futuro
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RevenueDataPointDto> getRevenueChart(LocalDate from, LocalDate to, String granularity) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();

        // JPQL no soporta DATE_TRUNC; usamos query nativa para agrupar por día/semana/mes
        String trunc = switch (granularity.toLowerCase()) {
            case "week"  -> "week";
            case "month" -> "month";
            default      -> "day";
        };

        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery(
                "SELECT DATE_TRUNC(:trunc, o.created_at)::date AS period, " +
                "SUM(o.total_amount) AS revenue, COUNT(o.id) AS orders " +
                "FROM orders o " +
                "WHERE o.status = 'CONFIRMED' " +
                "AND o.created_at >= :start AND o.created_at < :end " +
                "GROUP BY period ORDER BY period")
                .setParameter("trunc", trunc)
                .setParameter("start", start)
                .setParameter("end", end)
                .getResultList();

        DateTimeFormatter fmt = DateTimeFormatter.ISO_LOCAL_DATE;
        return rows.stream().map(row -> RevenueDataPointDto.builder()
                .date(row[0].toString())
                .revenue(((BigDecimal) row[1]).setScale(2, RoundingMode.HALF_UP))
                .orders(((Number) row[2]).longValue())
                .build()
        ).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopSellerDto> getTopSellers(LocalDate from, LocalDate to, int limit) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();

        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createQuery(
                "SELECT p.id, p.name, p.brand, " +
                "SUM(oi.quantity), SUM(oi.quantity * oi.unitPrice) " +
                "FROM OrderItem oi " +
                "JOIN oi.variant pv JOIN pv.product p JOIN oi.order o " +
                "WHERE o.status = :status " +
                "AND o.createdAt >= :start AND o.createdAt < :end " +
                "GROUP BY p.id, p.name, p.brand " +
                "ORDER BY SUM(oi.quantity * oi.unitPrice) DESC")
                .setParameter("status", OrderStatus.CONFIRMED)
                .setParameter("start", start)
                .setParameter("end", end)
                .setMaxResults(limit)
                .getResultList();

        return rows.stream().map(row -> TopSellerDto.builder()
                .productId((Long) row[0])
                .productName((String) row[1])
                .brand((String) row[2])
                .unitsSold(((Number) row[3]).longValue())
                .revenue(((BigDecimal) row[4]).setScale(2, RoundingMode.HALF_UP))
                .build()
        ).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderStatusCountDto> getOrdersByStatus() {
        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createQuery(
                "SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status ORDER BY COUNT(o) DESC")
                .getResultList();

        return rows.stream().map(row -> OrderStatusCountDto.builder()
                .status(((OrderStatus) row[0]).name())
                .count((Long) row[1])
                .build()
        ).toList();
    }
}
