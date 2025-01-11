package com.example.dreambackend.entities;
import lombok.Builder;
import jakarta.persistence.*;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDate;
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "chat_lieu")
public class ChatLieu{
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma")
    private String ma;

    @Column(name = "ten")
    private String ten;

    @Column(name = "ngay_sua")
    private LocalDate ngaySua;

    @Column(name = "ngay_tao")
    private LocalDate ngayTao;

    @Column(name = "trang_thai")
    private int trangThai;
}
