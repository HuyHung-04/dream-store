import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KhuyenmaiService, SanPhamChiTietDto } from './khuyenmai.service';
import { FormsModule } from '@angular/forms';
import { SanphamService } from '../sanpham/sanpham.service';

@Component({
  selector: 'app-khuyenmai',
  imports: [CommonModule, FormsModule],
  templateUrl: './khuyenmai.component.html',
  styleUrl: './khuyenmai.component.css'
})
export class KhuyenmaiComponent implements OnInit {
  khuyenmais: any[] = [];
  showModal: boolean = false;
  showModalDetail: boolean = false;
  showModalSearch: boolean = false;
  maxPages = 3;
  selectedTrangThai: number = 3;
  totalPages: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  sanPham: SanPhamChiTietDto[] = [];
  showChonSanPham: boolean = false;
  selectedKhuyenMaiId: number | null = null;
  showModalEdit = false;
  selectedKhuyenMai: any = null;
  khuyenmaiEdit: any = {};
  searchText: string = '';
  numberPages: number[] = [];
  filteredKhuyenMais: any[] = [];
  errors: any = {};
  khuyenmai: any = {
    id: '',
    ma: '',
    ten: '',
    giaTriGiam: null,
    ngayBatDau: '',
    ngayTao: '',
    ngaySua: '',
    ngayKetThuc: '',
    trangThai: null,
  };

  constructor(private khuyenmaiService: KhuyenmaiService, sanphamService: SanphamService) { }

  ngOnInit(): void {
    this.loadData()
  }

  resetForm() {
    this.khuyenmai = {
      ma: '',
      ten: '',
      giaTriGiam: null,
      ngayBatDau: '',
      ngayKetThuc: '',
      trangThai: null,
    };

  }
  editKhuyenMai(khuyenmaiId: number) {
    this.khuyenmaiService.chiTietKhuyenMai(khuyenmaiId).subscribe((khuyenmai) => {
      console.log(khuyenmai);
      this.khuyenmaiEdit = { ...khuyenmai };
      this.showModalEdit = true;
    });
  }


  addKhuyenMai() {
   
    if (!this.validateForm()) {
      return;
    }

     // Hiển thị hộp thoại xác nhận
     const isConfirmed = window.confirm('Bạn có chắc chắn muốn thêm khuyến mãi này?');

     if (!isConfirmed) {
       return; // Nếu người dùng không xác nhận, dừng việc thực hiện hàm
     }
 

    this.khuyenmaiService.addKhuyenMai(this.khuyenmai).subscribe(
      (response) => {
        alert('Thêm khuyến mãi thành công!');
        this.loadData();
        this.closeModal();
        this.resetForm();
      },
      (error) => {
        console.error('Error:', error);
        alert('Có lỗi xảy ra khi thêm khuyến mãi.');
      }
    );
  }

  clearError(field: string): void {
    if (this.errors[field]) {
      delete this.errors[field];
    }
  }

  chonSanPham(khuyenMaiId: number): void {
    // Tìm khuyến mãi theo ID
    const selectedKhuyenMai = this.khuyenmais.find(km => km.id === khuyenMaiId);

    if (!selectedKhuyenMai) {
      alert('Không tìm thấy khuyến mãi!');
      return;
    }

    // Kiểm tra nếu khuyến mãi không hoạt động
    if (!selectedKhuyenMai.trangThai) {
      alert('Khuyến mãi không hoạt động, không thể chọn sản phẩm!');
      return;
    }

    this.selectedKhuyenMaiId = khuyenMaiId;
    this.khuyenmaiService.getSanPham(khuyenMaiId).subscribe(
      (products) => {
        this.sanPham = products.filter((product) => !product.disabled);
        console.log('Filtered products:', this.sanPham);
        this.showChonSanPham = true;
      },
      (error) => {
        console.error('Error fetching available products:', error);
        alert('Có lỗi xảy ra khi lấy danh sách sản phẩm.');
      }
    );
  }

  closeChonSanPham(): void {
    this.showChonSanPham = false;
    this.sanPham = [];
  }


  luuSanPham(): void {
    if (this.selectedKhuyenMaiId === null) {
      alert('Không tìm thấy ID khuyến mãi!');
      return;
    }
    // Hiển thị hộp thoại xác nhận chỉ khi form hợp lệ
    const isConfirmed = window.confirm('Bạn có chắc chắn muốn lưu khuyến mãi cho sản phẩm không');

    if (!isConfirmed) {
      return; // Nếu người dùng không xác nhận, dừng việc thực hiện hàm
    }
    const selectedProductIds = this.sanPham
      .filter((product) => product.selected)
      .map((product) => product.id);

    this.khuyenmaiService.saveSanPhamWithKhuyenMai(this.selectedKhuyenMaiId, selectedProductIds).subscribe(
      (response: string) => {
        alert("Đã lưu sản phẩm");
        this.closeChonSanPham();
      },
      (error) => {
        alert('Có lỗi xảy ra khi lưu sản phẩm.');
      }
    );
  }

  validateForm(): boolean {
    this.errors = {};
    if (!this.khuyenmai.ma.trim()) {
      this.errors.ma = 'Mã khuyến mãi không được để trống!';
    }
    else {
      const checkTrungMa = this.khuyenmais.some(khuyenmai => khuyenmai.ma == this.khuyenmai.ma);
      if (checkTrungMa) {
        this.errors.ma = 'Mã khuyến mãi đã tồn tại!';
      }
    }
    if (!this.khuyenmai.ten.trim()) {
      this.errors.ten = 'Tên khuyến mãi không được để trống!';
    }

    if (this.khuyenmai.giaTriGiam === null || this.khuyenmai.giaTriGiam === undefined || this.khuyenmai.giaTriGiam === '') {
      this.errors.giaTriGiam = 'Giá trị giảm không được để trống!';
    } else {

      const checkSo = Number(this.khuyenmai.giaTriGiam);
      if (isNaN(checkSo)) {
        this.errors.giaTriGiam = 'Giá trị giảm phải là số!';
      } else if (checkSo <= 0) {
        this.errors.giaTriGiam = 'Giá trị giảm không được nhỏ hơn 1!';
      }
      else if (checkSo >100) {
        this.errors.giaTriGiam = 'Giá trị giảm không được quá 100%';
      }
    }

    if (!this.khuyenmai.ngayBatDau) {
      this.errors.ngayBatDau = 'Ngày bắt đầu không được để trống!';
    }

    if (!this.khuyenmai.ngayKetThuc) {
      this.errors.ngayKetThuc = 'Ngày kết thúc không được để trống!';
    }
    else {
      const currentDate = new Date();
      const startDate = new Date(this.khuyenmai.ngayBatDau);
      const endDate = new Date(`${this.khuyenmai.ngayKetThuc}T23:59:59.999`);

      if (startDate > endDate) {
        this.errors.ngayKetThuc = 'Ngày kết thúc phải sau ngày bắt đầu!';
      }

      if (endDate < currentDate) {
        this.errors.ngayKetThuc = 'Ngày kết thúc không được nhỏ hơn ngày hiện tại!';
      }
    }

    if (this.khuyenmai.trangThai === null || this.khuyenmai.trangThai === undefined) {
      this.errors.trangThai = 'Vui lòng chọn trạng thái!';
    }

    return Object.keys(this.errors).length === 0;
  }

  searchVoucherTheoTen(): void {
    if (this.searchText.trim() === '') {
      alert('Vui lòng nhập tên khuyến mãi để tìm kiếm.');
      return;
    }


    this.khuyenmaiService.timKhuyenMaiTheoTen(this.searchText).subscribe(
      (data) => {
        if (data.length > 0) {
          this.selectedKhuyenMai = data[0];
          this.showModalSearch = true;
        } else {
          alert('Không tìm thấy khuyến mãi phù hợp.');
        }
      },
      (error) => {
        console.error('Lỗi khi tìm kiếm khuyến mãi:', error);
        alert('Đã xảy ra lỗi khi tìm kiếm.');
      }
    );
  }
  validateEditForm(): boolean {
    this.errors = {};

    if (!this.khuyenmaiEdit.ma || !this.khuyenmaiEdit.ma.trim()) {
      this.errors.ma = 'Mã khuyến mãi không được để trống!';
    }

    if (!this.khuyenmaiEdit.ten || !this.khuyenmaiEdit.ten.trim()) {
      this.errors.ten = 'Tên khuyến mãi không được để trống!';
    }

    if (this.khuyenmaiEdit.giaTriGiam === null || this.khuyenmaiEdit.giaTriGiam === undefined || this.khuyenmaiEdit.giaTriGiam === '') {
      this.errors.giaTriGiam = 'Giá trị giảm không được để trống!';
    } else {
      const checkSo = Number(this.khuyenmaiEdit.giaTriGiam);
      if (isNaN(checkSo)) {
        this.errors.giaTriGiam = 'Giá trị giảm phải là số!';
      } else if (checkSo <1) {
        this.errors.giaTriGiam = 'Giá trị giảm không được nhỏ hơn 1';
      }
      else if (checkSo >100) {
        this.errors.giaTriGiam = 'Giá trị giảm không được lớn hơn 100%';
      }
    }
    if (!this.khuyenmaiEdit.ngayBatDau) {
      this.errors.ngayBatDau = 'Ngày bắt đầu không được để trống!';
    }
    // 6. Kiểm tra ngày kết thúc
    if (!this.khuyenmaiEdit.ngayKetThuc) {
      this.errors.ngayKetThuc = 'Ngày kết thúc không được để trống!';
    }
    else {
      const currentDate = new Date();
      const startDate = new Date(this.khuyenmaiEdit.ngayBatDau);
      const endDate = new Date(`${this.khuyenmaiEdit.ngayKetThuc}T23:59:59.999`);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      if (startDate > endDate) {
        this.errors.ngayKetThuc = 'Ngày kết thúc phải sau ngày bắt đầu!';
      }
      else if (endDate < currentDate && this.khuyenmaiEdit.trangThai == true) {
        this.errors.trangThai = 'Khuyến mãi đã hết hạn, trạng thái phải là "Không hoạt động".';
      }

    }
    if (this.khuyenmaiEdit.trangThai === null || this.khuyenmaiEdit.trangThai === undefined) {
      this.errors.trangThai = 'Vui lòng chọn trạng thái!';
    }


    return Object.keys(this.errors).length === 0;
  }

  updateKhuyenMai() {
    console.log("them")
    if (!this.validateEditForm()) {
      return; // return nếu chưa hợp lệ
    }

    // Hiển thị hộp thoại xác nhận chỉ khi form hợp lệ
    const isConfirmed = window.confirm('Bạn có chắc chắn muốn sửa khuyến mãi này?');

    if (!isConfirmed) {
      return; // Nếu người dùng không xác nhận, dừng việc thực hiện hàm
    }
    if (this.khuyenmaiEdit.id) {
      console.log("giatri", this.khuyenmaiEdit)
      this.khuyenmaiService.updateKhuyenMai(this.khuyenmaiEdit).subscribe(
        (response) => {
          alert('Cập nhật khuyến mãi thành công!');
          console.log("sua", response)
          this.loadData();
          this.closeModalEdit();
        },
        (error) => {
          console.error('Error:', error);
          alert('Có lỗi xảy ra khi cập nhật khuyến mãi.');
        }
      );
    } else {
      alert('ID khuyến mãi không hợp lệ!');
    }
  }


  showDetail(khuyenmaiId: number) {
    this.selectedKhuyenMai = this.khuyenmais.find(khuyenmai => khuyenmai.id === khuyenmaiId);
    this.showModalDetail = true;
  }

  locTheoTrangThai(trangThai: number, page: number): void {
    this.khuyenmaiService.locTrangThai(trangThai, page, 8).subscribe((response) => {
      this.khuyenmais = response.content;
      this.totalPages = response.totalPages;
      this.currentPage = page;
      this.tinhSoTrang();
      this.searchTenVoucher();
    });
  }
  loadData(): void {
    console.log(this.selectedTrangThai);
    console.log(this.searchTenVoucher());
    if (this.selectedTrangThai !== 3) {
      this.locTheoTrangThai(this.selectedTrangThai, 0);
    } else {
      this.loadPage(0);
    }
  }

  loadPage(page: number): void {
    this.khuyenmaiService.getKhuyenMai(page, 8).subscribe((response) => {
      this.khuyenmais = response.content; // Dữ liệu của trang hiện tại
      this.totalPages = response.totalPages; // Tổng số trang
      this.currentPage = page; // Cập nhật trang hiện tại
      this.tinhSoTrang();
      this.searchTenVoucher();
    });
  }

  searchTenVoucher() {
    if (this.searchText.trim()) {
      this.filteredKhuyenMais = this.khuyenmais.filter((khuyenmai) =>
        khuyenmai.ten.toLowerCase().includes(this.searchText.toLowerCase())
      );
    } else {
      this.filteredKhuyenMais = [...this.khuyenmais]; // Hiển thị tất cả nếu không tìm kiếm
    }
  }

  Page(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      if (this.selectedTrangThai !== 3) {
        this.locTheoTrangThai(this.selectedTrangThai, page);
      } else {
        this.loadPage(page);
      }

    } else {
      console.warn('Invalid page number:', page);
    }
  }

  PreviousPage(): void {
    if (this.currentPage > 0) {
      if (this.selectedTrangThai !== 3) {
        this.locTheoTrangThai(this.selectedTrangThai, this.currentPage - 1);
      } else {
        this.loadPage(this.currentPage - 1);
      }

    }
  }
  tinhSoTrang(): void {
    const startPage = Math.floor(this.currentPage / this.maxPages) * this.maxPages;
    const endPage = Math.min(startPage + this.maxPages, this.totalPages);
    this.numberPages = Array.from({ length: endPage - startPage }, (_, i) => startPage + i);
  }

  NextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      if (this.selectedTrangThai !== 3) {
        this.locTheoTrangThai(this.selectedTrangThai, this.currentPage + 1);
      } else {
        this.loadPage(this.currentPage + 1);
      }

    }
  }

  searchSanPham(): void {
    if (!this.selectedKhuyenMaiId) {
      alert('Vui lòng chọn khuyến mãi trước khi tìm kiếm sản phẩm.');
      return;
    }

    this.khuyenmaiService.getSanPham(this.selectedKhuyenMaiId, this.searchText).subscribe(
      (sanpham) => {
        this.sanPham = sanpham.filter((sanpham) => !sanpham.disabled);
      },
      (error) => {
        console.error('Lỗi khi tìm kiếm sản phẩm:', error);
        alert('Đã xảy ra lỗi khi tìm kiếm.');
      }
    );
  }


  openModal() {
    this.resetForm();
    this.showModal = true;
  }
  closeModal() {
    this.errors = {}
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
