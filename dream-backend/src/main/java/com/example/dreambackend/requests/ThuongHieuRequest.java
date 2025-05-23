package com.example.dreambackend.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Range;

import java.time.LocalDate;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ThuongHieuRequest {
    private Integer id;

    private String ma;

    @NotBlank(message = "Thương hiệu không được để trống")
    private String ten;

    private LocalDate ngayTao;

    private LocalDate ngaySua;

    @Range(min = 0, max = 1, message = "Vui lòng chọn trạng thái")
    private int trangThai;
}
