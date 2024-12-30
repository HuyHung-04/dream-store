package com.example.dreambackend.dtos;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class SanPhamDTO {

    private String ten;

    private Float gia;

    private Date ngayTao;

    private Date ngaySua;

    @JsonProperty("trang_thai")
    private int trangThai;
}
