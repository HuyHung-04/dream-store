package com.example.dreambackend.responses;

import lombok.*;

import java.time.LocalDate;
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SanPhamRespone {
    private Integer id;

    private String ma;

    private String ten;

    private LocalDate ngayTao;

    private LocalDate ngaySua;

    private int trangThai;

    private Integer idChatLieu;

    private String tenChatLieu;

    private Integer idThuongHieu;

    private String tenThuongHieu;

    private Integer idCoAo;

    private String tenCoAo;

    private Integer idXuatXu;

    private String tenXuatXu;

    private Double giaCaoNhat;

    private Integer tongSoLuong;
}

