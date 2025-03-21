package com.example.dreambackend.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VoucherDto {
    private Integer id;
    private String ten;
    private BigDecimal giamToiDa;
    private boolean hinhThucGiam;
    private BigDecimal giaTriGiam;
}
