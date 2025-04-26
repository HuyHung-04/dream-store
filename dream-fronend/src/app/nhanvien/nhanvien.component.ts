import { Component, OnInit } from '@angular/core';
import { NhanVienService } from './nhanvien.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-nhanvien',
  imports: [CommonModule, FormsModule],
  templateUrl: './nhanvien.component.html',
  styleUrls: ['./nhanvien.component.css']
})
export class NhanvienComponent implements OnInit {
  nhanViens: any[] = [];
  danhSachNhanVien: any[] = [];
  danhSachVaiTro: any[] = [];
  vaiTros: any[] = [];
  
  showModal: boolean = false;
  showModalDetail: boolean = false;
  showModalSearch: boolean = false;
  showModalEdit: boolean = false;
  
  maxVisiblePages = 8;
  totalPages: number = 0;
  currentPage: number = 0;
  pageSize: number = 5;
  
  selectedNhanVien: any = null;
  nhanVienEdit: any = {};
  searchText: string = '';
  visiblePages: number[] = [];
  filteredNhanViens: any[] = [];
  errors: any = {};
  selectedFile: File | null = null; // To store the selected file
  imagePreview: string | ArrayBuffer | null = null; // To store the image preview URL
  nhanVien: any = {
    id: '',
    ma: '',
    ten: '',
    anh:null,
    gioiTinh: null,
    ngaySinh: '',
    email: '',
    soDienThoai: '',
    taiKhoan: '',
    matKhau: '',
    trangThai: 1,
    vaiTro: {
      id: 2,  // Đây là phần liên kết với vai trò. Bạn sẽ cần phải cập nhật ID vai trò khi chọn vai trò cho nhân viên.
         // Nếu cần, bạn có thể thêm tên vai trò hoặc các thuộc tính khác của vai trò ở đây
    },
    ngayTao: '',
    ngaySua: ''
  };
  constructor(private nhanVienService: NhanVienService) { }
  ngOnInit(): void {
    this.loadData();
    this.getVaiTros();
  }
  // Reset form để thêm hoặc chỉnh sửa thông tin nhân viên
  resetForm() {
    this.nhanVien = {
      id: '',
      ma: '',
      ten: '',
      anh:null,
      gioiTinh: null,
      ngaySinh: '',
      email: '',
      soDienThoai: '',
      taiKhoan: '',
      matKhau: '',
      trangThai: 1,
      vaiTro: {
        id: 2,   // Vai trò của nhân viên, cần được chọn từ danh sách vai trò
      },
      ngayTao: '',
      ngaySua: ''
    };
  }
 editNhanVien(nhanVienId: number) {
  this.nhanVienService.getNhanVienDetail(nhanVienId).subscribe((nhanVien) => {
    this.nhanVienEdit = { ...nhanVien };  // Gán dữ liệu vào biến chỉnh sửa
    console.log("Dữ liệu nhân viên:", this.nhanVienEdit);
    
    // Kiểm tra nếu nhân viên có ảnh thì lấy đường dẫn từ API
    if (this.nhanVienEdit.anh) {
      this.imagePreview = this.nhanVienService.getNhanVienImage(this.nhanVienEdit.anh);
      console.log("Đường dẫn ảnh:", this.imagePreview);
    } else {
      this.imagePreview = null;
    }
    
    this.showModalEdit = true;  // Hiển thị modal chỉnh sửa
  }, (error) => {
    console.error("Lỗi khi lấy thông tin nhân viên:", error);
    alert("Không tìm thấy nhân viên!");
  });
}
  // Method to handle file selection and preview the image
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Create a FileReader to preview the image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result; // Store the preview URL
      };
      reader.readAsDataURL(file); // Read the selected file as a Data URL
    }
  }
  onFileSelectedForEdit(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
  
      // Tạo một FileReader để xem trước ảnh
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result; // Lưu URL của ảnh để hiển thị xem trước
      };
      reader.readAsDataURL(file); // Đọc tệp đã chọn dưới dạng Data URL
    }
  }
  addNhanVien() {
    if (!this.validateForm()) {
      return; // Prevent submission if form is not valid
    }
    this.nhanVien.vaiTro = { id: 2 };
    // Gửi dữ liệu nhân viên mà không có ảnh
    const nhanVienData = { ...this.nhanVien }; // Tạo bản sao dữ liệu nhân viên
    // Gọi API để thêm nhân viên
    this.nhanVienService.addNhanVien(nhanVienData).subscribe(
      (response) => {
        alert('Thêm nhân viên thành công!');
        this.loadData(); // Load lại dữ liệu nhân viên
        this.closeModal(); // Đóng modal
        this.resetForm(); // Reset form
        // Sau khi thêm nhân viên thành công, gọi API để thêm ảnh
        if (this.selectedFile) {
          this.addImageForNhanVien(response.id);
        }
      },
      (error) => {
        console.error('Error:', error);
        alert('Có lỗi xảy ra khi thêm nhân viên.');
      }
    );
  } 
  addImageForNhanVien(nhanVienId: number) {
    if (!this.selectedFile) {
      console.error('No file selected.');
      return;
    }
    // Gọi API để gửi file ảnh (File) trực tiếp
    this.nhanVienService.addImageForNhanVien(nhanVienId, this.selectedFile).subscribe(
      (response) => { 
        this.loadData(); // Tải lại dữ liệu nhân viên
      },
      (error) => {
        console.error('Error:', error);
        alert('Có lỗi xảy ra khi thêm ảnh.');
      }
    );
  }
   //  Xóa lỗi của form khi nhập lại
  clearError(field: string): void {
    if (this.errors[field]) {
      delete this.errors[field];
    }
  }
  validateForm(): boolean {
    this.errors = {};
  
    // Validate tên nhân viên
    if (!this.nhanVien.ten || this.nhanVien.ten.trim() === '') {
      this.errors.ten = 'Tên nhân viên không được để trống!';
    } else {
      const name = this.nhanVien.ten.trim();
      const specialCharPattern = /[!@#$%^&*(),.?":{}|<>0-9]/;
      if (name.length < 4) {
        this.errors.ten = 'Tên phải có ít nhất 4 ký tự!';
      } else if (name.length > 25) {
        this.errors.ten = 'Tên không được vượt quá 25 ký tự!';
      } else if (specialCharPattern.test(name)) {
        this.errors.ten = 'Tên không được chứa số hoặc ký tự đặc biệt!';
      }
    }
  
    // Validate giới tính
    if (this.nhanVien.gioiTinh === null || this.nhanVien.gioiTinh === undefined) {
      this.errors.gioiTinh = 'Vui lòng chọn giới tính!';
    }
  
    // Validate ngày sinh và tuổi
    if (!this.nhanVien.ngaySinh) {
      this.errors.ngaySinh = 'Ngày sinh không được để trống!';
    } else {
      const birthDate = new Date(this.nhanVien.ngaySinh);
      const currentDate = new Date();
      const age = currentDate.getFullYear() - birthDate.getFullYear();
  
      if (birthDate > currentDate) {
        this.errors.ngaySinh = 'Ngày sinh không hợp lệ!';
      } else if (
        age < 18 ||
        (age === 18 &&
          (currentDate.getMonth() < birthDate.getMonth() ||
            (currentDate.getMonth() === birthDate.getMonth() &&
              currentDate.getDate() < birthDate.getDate())))
      ) {
        this.errors.ngaySinh = 'Nhân viên phải đủ 18 tuổi!';
      }
    }
  
    // Validate email
    if (!this.nhanVien.email || this.nhanVien.email.trim() === '') {
      this.errors.email = 'Email không được để trống!';
    } else {
      const email = this.nhanVien.email.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email.length < 15) {
        this.errors.email = 'Email phải có ít nhất 15 ký tự!';
      } else if (email.length > 30) {
        this.errors.email = 'Email không được quá 30 ký tự!';
      } else if (!emailPattern.test(email)) {
        this.errors.email = 'Email không đúng định dạng!';
      } else if (/\s/.test(email)) {
        this.errors.email = 'Email không được chứa khoảng trắng!';
      } else {
        // Kiểm tra trùng email trong CSDL
        const isDuplicate = this.nhanViens.some(
          nv => nv.email === email && nv.id !== this.nhanVien.id
        );
        if (isDuplicate) {
          this.errors.email = 'Email đã tồn tại!';
        }
      }
    }
  
    // Validate số điện thoại
    if (!this.nhanVien.soDienThoai || this.nhanVien.soDienThoai.trim() === '') {
      this.errors.soDienThoai = 'Số điện thoại không được để trống!';
    } else {
      const phone = this.nhanVien.soDienThoai.trim();
      const phonePattern = /^0[1-9][0-9]{8}$/; // đúng 10 chữ số, bắt đầu bằng 0
      if (!phonePattern.test(phone)) {
        this.errors.soDienThoai = 'Số điện thoại không đúng định dạng!';
      } else if (/\s/.test(phone)) {
        this.errors.soDienThoai = 'Số điện thoại không được chứa khoảng trắng!';
      } else if (/[^0-9]/.test(phone)) {
        this.errors.soDienThoai = 'Số điện thoại chỉ được chứa số!';
      } else if (parseInt(phone) < 0) {
        this.errors.soDienThoai = 'Số điện thoại không hợp lệ!';
      } else {
        const isDuplicatePhone = this.nhanViens.some(
          nv => nv.soDienThoai === phone && nv.id !== this.nhanVien.id
        );
        if (isDuplicatePhone) {
          this.errors.soDienThoai = 'Số điện thoại đã tồn tại!';
        }
      }
    }
  
    // Validate tài khoản
    if (!this.nhanVien.taiKhoan || this.nhanVien.taiKhoan.trim() === '') {
      this.errors.taiKhoan = 'Tài khoản không được để trống!';
    } else {
      const username = this.nhanVien.taiKhoan.trim();
      if (username.length < 4) {
        this.errors.taiKhoan = 'Tài khoản phải có ít nhất 4 ký tự!';
      } else if (username.length > 10) {
        this.errors.taiKhoan = 'Tài khoản không được vượt quá 10 ký tự!';
      } else if (/[^a-zA-Z0-9]/.test(username)) {
        this.errors.taiKhoan = 'Tài khoản không được chứa ký tự đặc biệt!';
      } else {
        const isDuplicateUsername = this.nhanViens.some(
          nv => nv.taiKhoan === username && nv.id !== this.nhanVien.id
        );
        if (isDuplicateUsername) {
          this.errors.taiKhoan = 'Tài khoản đã tồn tại!';
        }
      }
    }
  
    // Validate mật khẩu
    if (!this.nhanVien.matKhau || this.nhanVien.matKhau.trim() === '') {
      this.errors.matKhau = 'Mật khẩu không được để trống!';
    } else if (this.nhanVien.matKhau.length < 6) {
      this.errors.matKhau = 'Mật khẩu phải có ít nhất 6 ký tự!';
    } else if (this.nhanVien.matKhau.length > 10) {
      this.errors.matKhau = 'Mật khẩu không được quá 10 ký tự!';
    } else {
      const isDuplicatePassword = this.nhanViens.some(
        nv => nv.matKhau === this.nhanVien.matKhau && nv.id !== this.nhanVien.id
      );
      if (isDuplicatePassword) {
        this.errors.matKhau = 'Mật khẩu đã tồn tại!';
      }
    }
  
    // Validate trạng thái
    if (this.nhanVien.trangThai === null || this.nhanVien.trangThai === undefined) {
      this.errors.trangThai = 'Vui lòng chọn trạng thái!';
    }
  
    return Object.keys(this.errors).length === 0;
  }  
  searchAndShowSearch(): void {
    if (this.searchText.trim() === '') {
      alert('Vui lòng nhập tên nhân viên để tìm kiếm.');
      return;
    }
    // Gọi API tìm kiếm nhân viên theo tên
    this.nhanVienService.searchNhanVienByName(this.searchText).subscribe(
      (data) => {
        if (data.length > 0) {
          this.selectedNhanVien = data[0]; // Hiển thị nhân viên đầu tiên trong kết quả
          this.showModalSearch = true; // Mở modal chi tiết nhân viên
        } else {
          alert('Không tìm thấy nhân viên phù hợp.');
        }
      },
      (error) => {
        console.error('Lỗi khi tìm kiếm nhân viên:', error);
        alert('Đã xảy ra lỗi khi tìm kiếm.');
      }
    );
  }
  validateEditForm(): boolean {
    this.errors = {};
  
    // Validate mã nhân viên
    if (!this.nhanVienEdit.ma || !this.nhanVienEdit.ma.trim()) {
      this.errors.ma = 'Mã nhân viên không được để trống!';
    }
  
    // Validate tên nhân viên
    const name = this.nhanVienEdit.ten?.trim();
    const specialCharPattern = /[!@#$%^&*(),.?":{}|<>0-9]/;
    if (!name) {
      this.errors.ten = 'Tên nhân viên không được để trống!';
    } else if (name.length < 4) {
      this.errors.ten = 'Tên phải có ít nhất 4 ký tự!';
    } else if (name.length > 25) {
      this.errors.ten = 'Tên không được vượt quá 25 ký tự!';
    } else if (specialCharPattern.test(name)) {
      this.errors.ten = 'Tên không được chứa số hoặc ký tự đặc biệt!';
    }
  
    // Validate giới tính
    if (this.nhanVienEdit.gioiTinh === null || this.nhanVienEdit.gioiTinh === undefined) {
      this.errors.gioiTinh = 'Vui lòng chọn giới tính!';
    }
  
    // Validate ngày sinh
    if (!this.nhanVienEdit.ngaySinh) {
      this.errors.ngaySinh = 'Ngày sinh không được để trống!';
    } else {
      const birthDate = new Date(this.nhanVienEdit.ngaySinh);
      const currentDate = new Date();
      const age = currentDate.getFullYear() - birthDate.getFullYear();
      if (birthDate > currentDate) {
        this.errors.ngaySinh = 'Ngày sinh không hợp lệ!';
      } else if (
        age < 18 ||
        (age === 18 &&
          (currentDate.getMonth() < birthDate.getMonth() ||
            (currentDate.getMonth() === birthDate.getMonth() &&
              currentDate.getDate() < birthDate.getDate())))
      ) {
        this.errors.ngaySinh = 'Nhân viên phải đủ 18 tuổi!';
      }
    }
  
    // Validate email
    const email = this.nhanVienEdit.email?.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      this.errors.email = 'Email không được để trống!';
    } else if (email.length < 15) {
      this.errors.email = 'Email phải có ít nhất 15 ký tự!';
    } else if (email.length > 30) {
      this.errors.email = 'Email không được quá 30 ký tự!';
    } else if (!emailPattern.test(email)) {
      this.errors.email = 'Email không đúng định dạng!';
    } else if (/\s/.test(email)) {
      this.errors.email = 'Email không được chứa khoảng trắng!';
    } else {
      const isDuplicate = this.nhanViens.some(
        nv => nv.email === email && nv.id !== this.nhanVienEdit.id
      );
      if (isDuplicate) {
        this.errors.email = 'Email đã tồn tại!';
      }
    }
  
    // Validate số điện thoại
    const phone = this.nhanVienEdit.soDienThoai?.trim();
    const phonePattern = /^0[1-9][0-9]{8}$/;
    if (!phone) {
      this.errors.soDienThoai = 'Số điện thoại không được để trống!';
    } else if (!phonePattern.test(phone)) {
      this.errors.soDienThoai = 'Số điện thoại không đúng định dạng!';
    } else if (/\s/.test(phone)) {
      this.errors.soDienThoai = 'Số điện thoại không được chứa khoảng trắng!';
    } else if (/[^0-9]/.test(phone)) {
      this.errors.soDienThoai = 'Số điện thoại chỉ được chứa số!';
    } else {
      const isDuplicatePhone = this.nhanViens.some(
        nv => nv.soDienThoai === phone && nv.id !== this.nhanVienEdit.id
      );
      if (isDuplicatePhone) {
        this.errors.soDienThoai = 'Số điện thoại đã tồn tại!';
      }
    }
  
    // Validate tài khoản
    const username = this.nhanVienEdit.taiKhoan?.trim();
    if (!username) {
      this.errors.taiKhoan = 'Tài khoản không được để trống!';
    } else if (username.length < 4) {
      this.errors.taiKhoan = 'Tài khoản phải có ít nhất 4 ký tự!';
    } else if (username.length > 10) {
      this.errors.taiKhoan = 'Tài khoản không được vượt quá 10 ký tự!';
    } else if (/[^a-zA-Z0-9]/.test(username)) {
      this.errors.taiKhoan = 'Tài khoản không được chứa ký tự đặc biệt!';
    } else {
      const isDuplicateUsername = this.nhanViens.some(
        nv => nv.taiKhoan === username && nv.id !== this.nhanVienEdit.id
      );
      if (isDuplicateUsername) {
        this.errors.taiKhoan = 'Tài khoản đã tồn tại!';
      }
    }
  
    // Validate mật khẩu (nếu sửa)
    const password = this.nhanVienEdit.matKhau?.trim();
    if (password) {
      if (password.length < 6) {
        this.errors.matKhau = 'Mật khẩu phải có ít nhất 6 ký tự!';
      } 
      } else {
        const isDuplicatePassword = this.nhanViens.some(
          nv => nv.matKhau === password && nv.id !== this.nhanVienEdit.id
        );
        if (isDuplicatePassword) {
          this.errors.matKhau = 'Mật khẩu đã tồn tại!';
        }
    }
  
    // Validate trạng thái
    if (this.nhanVienEdit.trangThai === null || this.nhanVienEdit.trangThai === undefined) {
      this.errors.trangThai = 'Vui lòng chọn trạng thái!';
    }
  
    return Object.keys(this.errors).length === 0;
  }
  updateNhanVien() {
    if (!this.validateEditForm()) {
      return; // Dừng nếu form không hợp lệ
    }
    if (this.nhanVienEdit.id) {
      // Nếu vai trò là Admin, giữ nguyên
      if (this.nhanVienEdit.vaiTro.ten !== 'Quản lý') {
        this.nhanVienEdit.vaiTro = { id: 2, ten: 'Nhân viên' };
      }
      this.nhanVienService.updateNhanVien(this.nhanVienEdit).subscribe(
        (response) => {
          alert('Cập nhật nhân viên thành công!');
          this.loadData();
          console.log('Updated NhanVien:', this.nhanVienEdit.ngaySua);
          this.closeModalEdit();
          // Cập nhật ảnh nếu có file mới
          if (this.selectedFile) {
            this.addImageForNhanVien(this.nhanVienEdit.id);
          }
        },
        (error) => {
          console.error('Error:', error);
          alert('Có lỗi xảy ra khi cập nhật nhân viên.');
        }
      );
    } else {
      alert('ID nhân viên không hợp lệ!');
    }
  }
showDetail(nhanVienId: number) {
  this.selectedNhanVien = this.nhanViens.find(nhanVien => nhanVien.id === nhanVienId);
  this.showModalDetail = true; // Hiển thị modal chi tiết
}
  //  Lấy danh sách nhân viên
  loadData(): void {
    this.loadPage(0);
  }
  //  Lấy danh sách vai trò
  getVaiTros() {
    this.nhanVienService.getVaiTros().subscribe(
      (data) => {
        this.danhSachVaiTro = data;
        console.log('📌 Danh sách vai trò:', this.danhSachVaiTro);
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách vai trò:', error);
      }
    );
  }
//  Method to get employee detail
getNhanVienDetail(id: number): void {
  this.nhanVienService.getNhanVienDetail(id).subscribe(
    (data) => {
      this.nhanVien = data; // Gán dữ liệu nhân viên vào biến nhanVien
      this.showModalDetail = true; // Hiển thị modal chi tiết
    },
    (error) => {
      console.error('Lỗi khi lấy chi tiết nhân viên:', error);
      alert('Không tìm thấy thông tin nhân viên!');
    }
  );
}
trangThaiFilter: number | null = 2;
loadPage(page: number): void {
  // Nếu trangThaiFilter là 2, thì không gửi tham số trạng thái lên APIz
  let trangThai: number | undefined = this.trangThaiFilter !== null ? this.trangThaiFilter : undefined;
  const idNhanVienDangNhap = localStorage.getItem('idNhanVien');
  const idDangNhap = idNhanVienDangNhap ? parseInt(idNhanVienDangNhap, 10) : undefined;
  this.nhanVienService.getNhanVien(page, this.pageSize, trangThai,idDangNhap).subscribe(
    (response) => {
      console.log("📌 Dữ liệu nhân viên nhận được:", response); // Debug dữ liệu
      this.nhanViens = response.content;
      this.totalPages = response.totalPages;
      this.currentPage = page;
      this.updateVisiblePages();
      this.filterNhanViens();
    },
    (error) => {
      console.error('❌ Lỗi khi tải danh sách nhân viên:', error);
    }
  );
}
// Hàm cập nhật trạng thái lọc và load lại danh sách
filterByTrangThai(trangThai: number | null): void {
  this.trangThaiFilter = trangThai; // Lưu trạng thái vào biến
  this.loadPage(0); // Load lại từ trang đầu
}
 // Giữ trạng thái khi chuyển trang
 goToPage(page: number): void {
  if (page >= 0 && page < this.totalPages) {
    this.loadPage(page);
  }
}
  filterNhanViens() {
    if (this.searchText.trim()) {
      this.filteredNhanViens = this.nhanViens.filter((nhanVien) =>
        nhanVien.ten.toLowerCase().includes(this.searchText.toLowerCase())
      );
    } else {
      this.filteredNhanViens = [...this.nhanViens]; // Hiển thị tất cả nếu không có tìm kiếm
    }
  }
  //  Tìm kiếm nhân viên
  searchNhanVien(): void {
    if (this.searchText.trim() === '') {
      alert('Vui lòng nhập tên nhân viên để tìm kiếm.');
      return;
    }

    this.nhanVienService.searchNhanVienByName(this.searchText).subscribe(
      (data) => {
        if (data.length > 0) {
          this.selectedNhanVien = data[0];
          this.showModalSearch = true;
        } else {
          alert('Không tìm thấy nhân viên phù hợp.');
        }
      },
      (error) => {
        console.error('Lỗi khi tìm kiếm nhân viên:', error);
      }
    );
  }
  goToPreviousPage(): void {
    if (this.currentPage > 0) {
      this.loadPage(this.currentPage - 1);
    }
  }
  updateVisiblePages(): void {
    const startPage = Math.floor(this.currentPage / this.maxVisiblePages) * this.maxVisiblePages;
    const endPage = Math.min(startPage + this.maxVisiblePages, this.totalPages);
    this.visiblePages = Array.from({ length: endPage - startPage }, (_, i) => startPage + i);
  }
  goToNextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.loadPage(this.currentPage + 1);
    }
  }
  openModal() {
    this.resetForm();
    this.showModal = true;
  }
  closeModal() {
    this.errors = {};
    this.resetForm();
    this.showModal = false;
  }
  openModalDetail() {
    this.resetForm();
    this.showModalDetail = true;
  }
  closeModalDetail() {
    this.resetForm();
    this.showModalDetail = false;
  }
  openModalEdit() {
    this.resetForm();
    this.showModalEdit = true;
  }
  closeModalEdit() {
    this.errors = {}
    this.resetForm();
    this.showModalEdit = false;
  }
  openModalSearch() {
    this.resetForm();
    this.showModalSearch = true;
  }
  closeModalSearch() {
    this.resetForm();
    this.showModalSearch = false;
  }
}