package com.kickscontrol.backend.controller;

import com.kickscontrol.backend.dto.response.ProductResponseDto;
import com.kickscontrol.backend.exception.ResourceNotFoundException;
import com.kickscontrol.backend.security.JwtAuthenticationFilter;
import com.kickscontrol.backend.service.ProductService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
@AutoConfigureMockMvc(addFilters = false)
class ProductControllerTest {

    @Autowired MockMvc mockMvc;

    @MockBean ProductService productService;
    @MockBean JwtAuthenticationFilter jwtAuthenticationFilter;
    @MockBean UserDetailsService userDetailsService;

    private static final ProductResponseDto SAMPLE_PRODUCT = ProductResponseDto.builder()
            .id(1L)
            .name("Air Max 90")
            .brand("Nike")
            .basePrice(new BigDecimal("129.99"))
            .build();

    // ─── GET /api/products ────────────────────────────────────────────────────

    @Test
    void getProducts_noFilters_returns200WithPage() throws Exception {
        when(productService.findAll(isNull(), isNull(), isNull(), isNull(), isNull(),
                isNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(SAMPLE_PRODUCT)));

        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].name").value("Air Max 90"))
                .andExpect(jsonPath("$.data.content[0].brand").value("Nike"));
    }

    @Test
    void getProducts_withBrandFilter_returns200() throws Exception {
        when(productService.findAll(isNull(), eq("Nike"), isNull(), isNull(), isNull(),
                isNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(SAMPLE_PRODUCT)));

        mockMvc.perform(get("/api/products").param("brand", "Nike"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].brand").value("Nike"));
    }

    @Test
    void getProducts_emptyResult_returns200WithEmptyPage() throws Exception {
        when(productService.findAll(any(), any(), any(), any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isEmpty());
    }

    // ─── GET /api/products/{id} ───────────────────────────────────────────────

    @Test
    void getProductById_exists_returns200() throws Exception {
        when(productService.findById(1L)).thenReturn(SAMPLE_PRODUCT);

        mockMvc.perform(get("/api/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.name").value("Air Max 90"));
    }

    @Test
    void getProductById_notFound_returns404() throws Exception {
        when(productService.findById(99L))
                .thenThrow(new ResourceNotFoundException("Product", "id", 99L));

        mockMvc.perform(get("/api/products/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ─── GET /api/products/brands ──────────────────────────────────────────────

    @Test
    void getBrands_returns200WithList() throws Exception {
        when(productService.findBrands()).thenReturn(List.of("Nike", "Adidas", "Puma"));

        mockMvc.perform(get("/api/products/brands"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0]").value("Nike"))
                .andExpect(jsonPath("$.data[1]").value("Adidas"));
    }

    // ─── GET /api/products/categories ─────────────────────────────────────────

    @Test
    void getCategories_returns200WithList() throws Exception {
        when(productService.findCategories()).thenReturn(List.of("Lifestyle", "Running"));

        mockMvc.perform(get("/api/products/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0]").value("Lifestyle"));
    }
}
