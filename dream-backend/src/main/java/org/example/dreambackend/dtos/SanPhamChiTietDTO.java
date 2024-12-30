package org.example.dreambackend.dtos;

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

    private Date ngaySua;

    private Date ngayTao;
}
