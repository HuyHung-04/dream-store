package com.example.dreambackend.services.phivanchuyen;

import com.example.dreambackend.dtos.ShippingFeeRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class ShippingFeeService {

    private final RestTemplate restTemplate;
    private final String apiUrl = "https://services.giaohangtietkiem.vn/services/shipment/fee";

    @Value("${giaohangtietkiem.api.token}")
    private String apiToken;

    @Value("${giaohangtietkiem.partner.code}")
    private String partnerCode;

    public ShippingFeeService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public ResponseEntity<String> calculateShippingFee(ShippingFeeRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token",  "APITokenSample-ca441e70288cB0515F310742");
        headers.set("X-Client-Source", "https://services.giaohangtietkiem.vn/services/shipment/fee?address=P.503%20t%C3%B2a%20nh%C3%A0%20Auu%20Vi%E1%BB%87t,%20s%E1%BB%91%201%20L%C3%AA%20%C4%90%E1%BB%A9c%20Th%E1%BB%8D&province=H%C3%A0%20n%E1%BB%99i&district=Qu%E1%BA%ADn%20C%E1%BA%A7u%20Gi%E1%BA%A5y&pick_province=H%C3%A0%20N%E1%BB%99i&pick_district=Qu%E1%BA%ADn%20Hai%20B%C3%A0%20Tr%C6%B0ng&weight=1000&value=3000000&deliver_option=xteam&tags%5B%5D=1");

        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl(apiUrl)
                .queryParam("address", request.getAddress())
                .queryParam("province", request.getProvince())
                .queryParam("district", request.getDistrict())
                .queryParam("pick_province", request.getPickProvince())
                .queryParam("pick_district", request.getPickDistrict())
                .queryParam("weight", request.getWeight())
                .queryParam("value", request.getValue())
                .queryParam("deliver_option", request.getDeliverOption());

        HttpEntity<String> entity = new HttpEntity<>(headers);
        return restTemplate.exchange(uriBuilder.toUriString(), HttpMethod.GET, entity, String.class);
    }
}
