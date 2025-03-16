package com.example.dreambackend.dtos;

public class ShippingFeeRequest {
    private String address;
    private String province;
    private String district;
    private String pickProvince;
    private String pickDistrict;
    private Integer weight;
    private Integer value;
    private String deliverOption;

    // Getter và Setter cho address
    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    // Getter và Setter cho province
    public String getProvince() {
        return province;
    }

    public void setProvince(String province) {
        this.province = province;
    }

    // Getter và Setter cho district
    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    // Getter và Setter cho pickProvince
    public String getPickProvince() {
        return pickProvince;
    }

    public void setPickProvince(String pickProvince) {
        this.pickProvince = pickProvince;
    }

    // Getter và Setter cho pickDistrict
    public String getPickDistrict() {
        return pickDistrict;
    }

    public void setPickDistrict(String pickDistrict) {
        this.pickDistrict = pickDistrict;
    }

    // Getter và Setter cho weight
    public Integer getWeight() {
        return weight;
    }

    public void setWeight(Integer weight) {
        this.weight = weight;
    }

    // Getter và Setter cho value
    public Integer getValue() {
        return value;
    }

    public void setValue(Integer value) {
        this.value = value;
    }

    // Getter và Setter cho deliverOption
    public String getDeliverOption() {
        return deliverOption;
    }

    public void setDeliverOption(String deliverOption) {
        this.deliverOption = deliverOption;
    }
}
