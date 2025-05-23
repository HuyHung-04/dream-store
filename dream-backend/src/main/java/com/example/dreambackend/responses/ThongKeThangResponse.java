package com.example.dreambackend.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThongKeThangResponse {
    private int thang;
    private double tongDoanhThu;
}
