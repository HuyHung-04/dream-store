package com.example.dreambackend.requests;

import com.example.dreambackend.entities.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Range;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SanPhamRequest {
    private Integer id;


    private String ma;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String ten;

    private LocalDate ngayTao;

    private LocalDate ngaySua;

    @Range(min = 0, max = 1, message = "Vui lòng chọn trạng thái")
    private Integer trangThai;

    @NotNull(message = "Vui lòng chọn chất liệu")
    private ChatLieu chatLieu;

    @NotNull(message = "Vui lòng chọn thương hiệu")
    private ThuongHieu thuongHieu;

    @NotNull(message = "Vui lòng chọn cổ áo")
    private CoAo coAo;

    @NotNull(message = "Vui lòng chọn xuất xứ")
    private XuatXu xuatXu;


}
