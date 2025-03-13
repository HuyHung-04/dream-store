package com.example.dreambackend.services.phivanchuyen;

import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GoogleMapsService {

    private static final String GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY"; // Thay thế bằng API Key của bạn
    private static final String GOOGLE_MAPS_DISTANCE_URL = "https://maps.googleapis.com/maps/api/distancematrix/json";

    private final RestTemplate restTemplate;

    public GoogleMapsService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public double getDistance(double lat1, double lon1, double lat2, double lon2) {
        String url = GOOGLE_MAPS_DISTANCE_URL + "?origins=" + lat1 + "," + lon1 + "&destinations=" + lat2 + "," + lon2 + "&key=" + GOOGLE_MAPS_API_KEY;
        String response = restTemplate.getForObject(url, String.class);

        // Giải mã JSON từ kết quả của Google Maps API
        JSONObject jsonResponse = new JSONObject(response);
        double distance = jsonResponse.getJSONArray("rows")
                .getJSONObject(0)
                .getJSONArray("elements")
                .getJSONObject(0)
                .getJSONObject("distance")
                .getDouble("value");

        // Convert distance từ meters sang km
        return distance / 1000;
    }
}
