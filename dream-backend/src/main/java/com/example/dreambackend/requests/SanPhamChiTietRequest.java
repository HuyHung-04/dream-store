package com.example.dreambackend.requests;

import com.example.dreambackend.entities.MauSac;
import com.example.dreambackend.entities.SanPham;
import com.example.dreambackend.entities.Size;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Range;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SanPhamChiTietRequest {
    private Integer id;

    private String ma;

    @NotNull(message = "Giá không được để trống")
    @DecimalMin(value = "1", message = "Giá phải từ 1 trở lên")
    @DecimalMax(value = "20000000", message = "Giá tối đa là 20,000,000")
    @Digits(integer = 8, fraction = 0, message = "Giá phải là số hợp lệ")
    private Double gia;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 0, message = "Số lượng không được âm")
    @Digits(integer = 6, fraction = 0, message = "Số lượng phải là số nguyên hợp lệ")
    private int soLuong;

    private LocalDate ngayTao;
    private LocalDate ngaySua;

    @Range(min = 0, max = 1, message = "Vui lòng chọn trạng thái")
    private int trangThai;

    private SanPham sanPham;

    private List<Integer> sizes;

    private List<Integer> mauSacs;
}
