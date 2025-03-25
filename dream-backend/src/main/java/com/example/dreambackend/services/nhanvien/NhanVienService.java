package com.example.dreambackend.services.nhanvien;

import com.example.dreambackend.entities.NhanVien;
import com.example.dreambackend.entities.VaiTro;
import com.example.dreambackend.repositories.NhanVienRepository;
import com.example.dreambackend.repositories.VaiTroRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class NhanVienService implements INhanVienService {
    @Autowired
    private NhanVienRepository nhanVienRepository;
    @Autowired
    private VaiTroRepository vaiTroRepository;
    @Transactional
    @Override
    public Page<NhanVien> getAllNhanVienPaged(int page, int size) {
        return nhanVienRepository.findAll(PageRequest.of(page, size));
    }
    @Transactional
    @Override
    public NhanVien addNhanVien(NhanVien nhanVien) {
        VaiTro vaiTro = vaiTroRepository.findByTen("Nhân viên")
                .orElseThrow(() -> new IllegalArgumentException("Vai trò Nhân viên không tồn tại!"));
        // Gán vai trò cho nhân viên
        nhanVien.setVaiTro(vaiTro);
        nhanVien.setMa(taoMaNhanVien());
        // Gán ngày tạo hiện tại
        nhanVien.setNgayTao(LocalDate.now());
        return nhanVienRepository.save(nhanVien);
    }
    // Đường dẫn thư mục lưu trữ ảnh
    private static final String UPLOAD_DIR = "D:/dream-store/dream-backend/uploads/images/";
    // Cập nhật hoặc thêm ảnh cho nhân viên
    @Transactional
    @Override
    public NhanVien addImageForNhanVien(Integer nhanVienId, MultipartFile file) throws IOException {
        NhanVien existingNhanVien = nhanVienRepository.findById(nhanVienId)
                .orElseThrow(() -> new IllegalArgumentException("Nhân viên không tồn tại!"));

        if (file != null && !file.isEmpty()) {
            // Kiểm tra MIME type
            String contentType = file.getContentType();
            String fileExtension = getFileExtension(file.getOriginalFilename());

            if (!isSupportedImageFormat(contentType, fileExtension)) {
                throw new IllegalArgumentException("Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif, bmp, tiff, heif, avif, webp, jfif)!");
            }

            // Lấy tên file ảnh
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path path = Paths.get(UPLOAD_DIR, fileName);

            // Tạo thư mục nếu chưa tồn tại
            Files.createDirectories(path.getParent());

            // Lưu ảnh vào thư mục
            Files.write(path, file.getBytes());

            // Cập nhật đường dẫn ảnh vào nhân viên
            existingNhanVien.setAnh(fileName);
        }

        return nhanVienRepository.save(existingNhanVien);
    }

    private String taoMaNhanVien() {
        Random random = new Random();
        String maNhanVien;
        do {
            int soNgauNhien = 1 + random.nextInt(9999); // Sinh số từ 1 đến 9999
            String maSo = String.format("%04d", soNgauNhien); // Định dạng thành 4 chữ số
            maNhanVien = "NV" + maSo;
        } while (nhanVienRepository.existsByMa(maNhanVien)); // Kiểm tra xem mã đã tồn tại chưa
        return maNhanVien;
    }

    // Hàm lấy phần mở rộng của file
    private String getFileExtension(String fileName) {
        if (fileName != null && fileName.contains(".")) {
            return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        }
        return "";
    }

    // Hàm kiểm tra định dạng ảnh được hỗ trợ
    private boolean isSupportedImageFormat(String contentType, String extension) {
        List<String> supportedExtensions = List.of("jpg", "jpeg", "png", "gif", "bmp", "tiff", "heif", "avif", "webp", "jfif");
        return (contentType != null && contentType.startsWith("image/")) || supportedExtensions.contains(extension);
    }

    @Override
    @Transactional
    public NhanVien updateNhanVien(NhanVien nhanVien) {
        // 🔹 Kiểm tra nhân viên có tồn tại không
        NhanVien existingNhanVien = nhanVienRepository.findById(nhanVien.getId())
                .orElseThrow(() -> new IllegalArgumentException("Nhân viên không tồn tại!"));
        // 🔹 Kiểm tra vai trò có tồn tại không
        VaiTro vaiTro = vaiTroRepository.findById(nhanVien.getVaiTro().getId())
                .orElseThrow(() -> new IllegalArgumentException("Vai trò không tồn tại!"));
        // 🔹 Cập nhật thông tin nhân viên
        existingNhanVien.setTen(nhanVien.getTen());
        existingNhanVien.setGioiTinh(nhanVien.getGioiTinh());
        existingNhanVien.setNgaySinh(nhanVien.getNgaySinh());
        existingNhanVien.setEmail(nhanVien.getEmail());
        existingNhanVien.setSoDienThoai(nhanVien.getSoDienThoai());
        existingNhanVien.setTaiKhoan(nhanVien.getTaiKhoan());
        existingNhanVien.setMatKhau(nhanVien.getMatKhau());
        existingNhanVien.setTrangThai(nhanVien.getTrangThai());
        existingNhanVien.setNgaySua(LocalDate.now());
        // 🔹 Gán vai trò mới
        existingNhanVien.setVaiTro(vaiTro);

        return nhanVienRepository.save(existingNhanVien);
    }
    @Override
    public NhanVien getNhanVienById(Integer id) {
        return nhanVienRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Nhân viên không tồn tại với id: " + id));
    }
    @Override
    public List<NhanVien> searchNhanVienByName(String ten) {
        return nhanVienRepository.findByTenContainingIgnoreCase(ten);
    }

    @Override
    public ResponseEntity<?> login(String email, String password) {
        // Kiểm tra xem nhân viên có tồn tại không
        Optional<NhanVien> nhanVienOptional = nhanVienRepository.findByEmail(email);

        if (nhanVienOptional.isPresent()) {
            NhanVien nhanVien = nhanVienOptional.get();

            // Kiểm tra mật khẩu
            if (password.equals(nhanVien.getMatKhau())) {
                // Đăng nhập thành công, trả về thông tin nhân viên
                return ResponseEntity.ok(nhanVien); // Trả về thông tin nhân viên nếu đăng nhập thành công
            } else {
                // Mật khẩu không đúng
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Sai mật khẩu."); // Trả về lỗi với mã HTTP 401 (Unauthorized)
            }
        } else {
            // Không tìm thấy nhân viên với email này
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Email không tồn tại: "); // Trả về lỗi với mã HTTP 404 (Not Found)
        }
    }
    @Override
    public Page<NhanVien> getNhanVienByTrangThai(Integer trangThai, int page, int size) {
        return nhanVienRepository.findByTrangThai(trangThai, PageRequest.of(page, size));
    }
    @Override
    public Page<NhanVien> getAllNhanVien(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return nhanVienRepository.findAll(pageable);
    }
}