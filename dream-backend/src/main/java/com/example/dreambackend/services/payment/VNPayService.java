package com.example.dreambackend.services.payment;


import com.example.dreambackend.configs.VNpayConfig;
import com.example.dreambackend.dtos.PaymentDto;
import com.example.dreambackend.ultils.VNPayUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;


import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class VNPayService {
    private VNpayConfig vNpayConfig;

    public VNPayService(VNpayConfig vNpayConfig) {
        this.vNpayConfig = vNpayConfig;
    }

    public PaymentDto createVnPayPayment(long amount) throws Exception {
        // Chuyển đổi amount sang đơn vị cent (VNĐ * 100)
        long amountInCent = amount * 100L;

        // Lấy cấu hình VNPay
        Map<String, String> vnpParamsMap = vNpayConfig.getVNPayConfig();

        // Thêm thông tin amount và bankCode vào params
        vnpParamsMap.put("vnp_Amount", String.valueOf(amountInCent));
        vnpParamsMap.put("vnp_BankCode", "NCB");

        // Lấy địa chỉ IP
        String ipAddress = VNPayUtil.getIpAddress(getRandomIpAddress());
        vnpParamsMap.put("vnp_IpAddr", ipAddress);

        // Cài đặt ngày tạo giao dịch
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnpParamsMap.put("vnp_CreateDate", vnp_CreateDate);

        // Cài đặt ngày hết hạn giao dịch (12 giờ sau)
        cld.add(Calendar.MINUTE, 60 * 12);  // 12 giờ
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnpParamsMap.put("vnp_ExpireDate", vnp_ExpireDate);

        // Tạo URL truy vấn
        String queryUrl = createQueryUrl(vnpParamsMap);

        // Tính toán Secure Hash
        String vnpSecureHash = hmacSHA512(vNpayConfig.getSecretKey(), queryUrl);

        // Tạo URL thanh toán
        String paymentUrl = vNpayConfig.getVnp_PayUrl() + "?" + queryUrl + "&vnp_SecureHash=" + vnpSecureHash;

        return PaymentDto.builder()
                .code("ok")
                .message("success")
                .paymentUrl(paymentUrl).build();
    }

    public static String getRandomIpAddress() {
        Random random = new Random();
        int part1 = random.nextInt(256);
        int part2 = random.nextInt(256);
        int part3 = random.nextInt(256);
        int part4 = random.nextInt(256);
        return part1 + "." + part2 + "." + part3 + "." + part4;
    }

    private String createQueryUrl(Map<String, String> params) {
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                hashData.append(fieldName);
                hashData.append('=');
                try {
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                } catch (UnsupportedEncodingException e) {
                    e.printStackTrace();
                }
                if (itr.hasNext()) {
                    hashData.append('&');
                }
            }
        }
        return hashData.toString();
    }

    public String hmacSHA512(String key, String data) throws Exception {
        javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA512");
        javax.crypto.spec.SecretKeySpec secretKeySpec = new javax.crypto.spec.SecretKeySpec(key.getBytes(), "HmacSHA512");
        mac.init(secretKeySpec);
        byte[] hmacBytes = mac.doFinal(data.getBytes());
        StringBuilder result = new StringBuilder();
        for (byte b : hmacBytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
}
