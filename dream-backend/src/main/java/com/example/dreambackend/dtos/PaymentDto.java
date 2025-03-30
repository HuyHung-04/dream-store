package com.example.dreambackend.dtos;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class PaymentDto {
    public String code;
    public String message;
    public String paymentUrl;
}
