package com.example.dreambackend.requests;

import lombok.Data;

@Data
public class GhnShippingRequest {

    private int service_id;
    private int insurance_value;
    private String coupon;
    private int from_district_id;
    private int to_district_id;
    private String to_ward_code;
    private int height;
    private int length;
    private int weight;
    private int width;
}
