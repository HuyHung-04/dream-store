package com.example.dreambackend.ultils;

import jakarta.servlet.http.HttpServletRequest;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;
public class VNPayUtil {
    public static String hmacSHA512(final String key, final String data) {
        try {
            // Kiểm tra khóa và dữ liệu đầu vào không được null
            if (key == null || data == null) {
                throw new NullPointerException();
            }
            // Tạo đối tượng Mac với thuật toán HmacSHA512
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes();
            // Tạo khóa bí mật từ khóa đầu vào
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey); // Khởi tạo đối tượng Mac với khóa bí mật
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8); // Chuyển đổi dữ liệu đầu vào sang byte array
            byte[] result = hmac512.doFinal(dataBytes); // Tính toán HMAC
            StringBuilder sb = new StringBuilder(2 * result.length);
            // Chuyển đổi byte array kết quả thành chuỗi hexa
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            return ""; // Trả về chuỗi rỗng nếu có lỗi xảy ra
        }
    }

    public static String getIpAddress(String ipAddress) {
        // Kiểm tra xem địa chỉ IP có hợp lệ không
        if (ipAddress == null || ipAddress.isEmpty()) {
            return "Invalid IP";
        }
        return ipAddress;  // Trả về địa chỉ IP đã được truyền vào
    }

    public static String getRandomNumber(int len) {
        Random rnd = new Random(); // Tạo đối tượng Random
        String chars = "0123456789"; // Chuỗi các ký tự số
        StringBuilder sb = new StringBuilder(len);
        // Tạo chuỗi số ngẫu nhiên
        for (int i = 0; i < len; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }

    public static String getPaymentURL(Map<String, String> paramsMap, boolean encodeKey) {
        // Xây dựng URL từ Map của các cặp khóa-giá trị
        return paramsMap.entrySet().stream()
                .filter(entry -> entry.getValue() != null && !entry.getValue().isEmpty()) // Lọc các giá trị null hoặc rỗng
                .sorted(Map.Entry.comparingByKey()) // Sắp xếp theo khóa
                .map(entry ->
                        (encodeKey ? URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII) : entry.getKey()) + "=" + // Mã hóa khóa nếu encodeKey = true
                                URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII)) // Mã hóa giá trị
                .collect(Collectors.joining("&")); // Nối các cặp khóa-giá trị bằng dấu &
    }
}
