package com.example.dreambackend.dtos;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Data
@Getter
@Setter
public class DataTableResults<T> {
    private Integer recordsTotal;
    private List<T> data;
}
