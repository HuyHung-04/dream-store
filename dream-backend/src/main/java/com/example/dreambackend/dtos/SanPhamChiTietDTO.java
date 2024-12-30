package com.example.dreambackend.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.Date;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class SanPhamChiTietDTO {
    @JsonProperty("so_luong")
    private int soLuong;

    @JsonProperty("id_san_pham")
    private Integer idSanPham;

    private Date ngaySua;

    private Date ngayTao;

    @JsonProperty("trang_thai")
    private int trangThai;
}
