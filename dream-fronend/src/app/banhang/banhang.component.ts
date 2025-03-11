import { Component ,OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {CurrencyPipe, NgClass} from '@angular/common';
import { BanhangService } from './banhang.service';

@Component({
  selector: 'app-banhang',
  templateUrl: './banhang.component.html',
  imports: [
    FormsModule,
    NgClass,
    CurrencyPipe,
    CommonModule
  ],
  styleUrls: ['./banhang.component.css']
})
export class BanhangComponent {
  searchText: string = '';
  selectedCategory: string = '';
  invoices: number[] = [1]; // Danh sách hóa đơn // cái nãy cũ fix cứng hoá đơn không dùng
  selectedTab: number = 0;
  discountCode: string = '';
  discountAmount: number = 0;
  selectedPaymentMethod: string = 'cash';


  // khai báo + phân trang + hùng khai báo
  sanPhams: any[] = [];
  page: number = 0;
  size: number = 3;
  totalPages: number = 0;
  cart: any[] = [];
  categories = ['Nike Mercurial', 'Nike Phantom', 'Nike Tiempo'];
  // Lọc sản phẩm theo danh mục hoặc tìm kiếm
  invoices1: { id: number, ma: string }[] = [];
  invoiceCount = 1;
  // nhập sdt hiện tên
  soDienThoai: string = '';
  tenKhachHang: string = '';
  // đổi màu khi chọn button
  selectedInvoice: any = null;
  // hiển thị khách hàng và chọn
  selectedKhachHang: any = null;
  // thêm vào giỏ theo id hoá đơn
  cartMap: { [hoaDonId: number]: any[] } = {};
  constructor(private banhangService: BanhangService) { }


  ngOnInit(): void {
    this.loadSanPhamToBanHang();
    this.cart = this.cartMap[this.invoices[this.selectedTab]] || [];
  }
  
  // tạo hoá đơn
  createInvoice() {
    console.log("Khách hàng đã chọn:", this.selectedKhachHang); // Debug khách hàng
    if (!this.selectedKhachHang || this.tenKhachHang === 'Không tìm thấy') {
      alert('Vui lòng nhập số điện thoại khách hàng hợp lệ trước khi tạo hóa đơn.');
      return;
    }
    const request = {
      idKhachHang: this.selectedKhachHang.id, // Gán ID khách hàng đã tìm được
      idNhanVien: 1,
      idVoucher: 1,
      idPhuongThucThanhToan: 1,
      tenNguoiNhan: this.tenKhachHang,
      sdtNguoiNhan: this.soDienThoai,
      diaChiNhanHang: '',
      hinhThucThanhToan: '',
      phiVanChuyen: 0,
      tongTienTruocVoucher: 0,
      tongTienThanhToan: 0,
      ngayNhanDuKien: '',
      ngayTao: new Date().toISOString(),
      ngaySua: new Date().toISOString(),
      trangThai: 0,
      ghiChu: ''
    };
    console.log("Dữ liệu gửi lên API:", request); // Debug dữ liệu gửi lên
    this.banhangService.createHoaDon(request).subscribe(
      (response) => {
        console.log('Hóa đơn đã tạo:', response); // Kiểm tra dữ liệu từ backend
        this.invoices1.push({ id: response.id, ma: response.maHoaDon }); 
        this.invoiceCount++;
      },
      (error) => {
        console.error('Lỗi khi tạo hóa đơn:', error);
      }
    );    
  }
  
  // đổi màu khi chọn button đồng thời chọn hoá đơn để thêm vào giỏ
  selectInvoice(invoice: any) {
    console.log("Hóa đơn được chọn:", invoice); // Debug dữ liệu hóa đơn
    this.selectedInvoice = invoice;
    this.cart = this.cartMap[invoice.id] || []; 
  }
  
  // tìm khách hàng theo sdt và add vào hoá đơn
  timKhachHang() {
    if (this.soDienThoai.trim() === '') return;
    this.banhangService.getKhachHangBySdt(this.soDienThoai).subscribe(
      (khachHang: any) => {
        console.log('Dữ liệu khách hàng từ API:', khachHang); // Debug dữ liệu trả về
  
        if (khachHang && khachHang.id) {  // Kiểm tra dữ liệu trả về có id hay không
          this.tenKhachHang = khachHang.ten;
          this.selectedKhachHang = khachHang;
        } else {
          this.tenKhachHang = 'Không tìm thấy';
          this.selectedKhachHang = null;
        }
      },
      (error) => {
        console.error('Lỗi lấy thông tin khách hàng:', error);
        this.tenKhachHang = 'Không tìm thấy';
        this.selectedKhachHang = null;
      }
    );
  }
  
  // hiển thị sản danh sách sản phẩm
  loadSanPhamToBanHang(): void {
    this.banhangService.getSanPham(this.page, this.size).subscribe(response => {
      this.sanPhams = response.content;
      this.totalPages = response.totalPages;
    });
  }
  /*phân trang*/
  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadSanPhamToBanHang();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadSanPhamToBanHang();
    }
  }
  
  filteredSanPhams() {
    return this.sanPhams.filter(sp =>
      (this.selectedCategory === '' || sp.tenSanPham.includes(this.selectedCategory)) &&
      (this.searchText === '' || sp.tenSanPham.toLowerCase().includes(this.searchText.toLowerCase()))
    );
  }
  
  // Xem chi tiết sản phẩm
  viewProductDetails(product: any) {
    console.log('Xem chi tiết sản phẩm:', product);
    alert(`Sản phẩm: ${product.name}\nGiá: ${product.price.toLocaleString()} VND`);
  }

  // Thêm sản phẩm vào giỏ hàng
  addToCart(product: any) {
    const hoaDonId = this.selectedInvoice?.id; // Lấy id của hóa đơn đã chọn
    if (!hoaDonId) {
      alert("Vui lòng chọn hóa đơn trước khi thêm sản phẩm vào giỏ hàng!");
      return;
    }
    if (!this.cartMap[hoaDonId]) {
      this.cartMap[hoaDonId] = [];
    }
    const existingItem = this.cartMap[hoaDonId].find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        existingItem.quantity++;
        // Gọi API cập nhật số lượng sản phẩm trong hóa đơn
        this.banhangService.addSanPhamToHoaDon(hoaDonId, product.id, existingItem.quantity).subscribe(
          () => console.log('Cập nhật số lượng sản phẩm thành công'),
          error => console.error('Lỗi khi cập nhật số lượng:', error)
        );
      } else {
        alert('Số lượng sản phẩm không đủ!');
      }
    } else {
      // Gọi API thêm sản phẩm mới vào hóa đơn
      this.banhangService.addSanPhamToHoaDon(hoaDonId, product.id, 1).subscribe(
        (response) => {
          const newItem = { 
            ...product, 
            quantity: 1, 
            donGia: response.donGia, 
            idHoaDonChiTiet: response.ma 
          };
          this.cartMap[hoaDonId].push(newItem); // Cập nhật cartMap
          this.cart = [...this.cartMap[hoaDonId]]; // Cập nhật cart để UI render lại
          console.log('Thêm sản phẩm vào giỏ hàng thành công:', response);
        },
        error => console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', error)
      );
    }
  }

  // Xóa sản phẩm khỏi giỏ hàng
  removeFromCart(item: any) {
    this.cart = this.cart.filter(cartItem => cartItem.id !== item.id);
  }

  // Kiểm tra số lượng giỏ hàng
  validateQuantity(item: any) {
    const product = this.sanPhams.find(p => p.id === item.id);
    if (!product) {
      alert('Sản phẩm không tồn tại!');
      return;
    }

    if (item.quantity < 1 || isNaN(item.quantity)) {
      item.quantity = 1;
    } else if (item.quantity > product.stock) {
      item.quantity = product.stock;
      alert('Số lượng sản phẩm không đủ!');
    }
  }


  // Tính tổng tiền giỏ hàng
  getTotal() {
    return this.cart.reduce((total, item) => total + item.price * item.quantity, 0) - this.discountAmount;
  }

  // Áp dụng mã giảm giá
  applyDiscount() {
    if (this.discountCode === 'GIAM10') {
      this.discountAmount = this.getTotal() * 0.1;
    } else {
      this.discountAmount = 0;
      alert('Mã giảm giá không hợp lệ!');
    }
  }

  // Chọn tab hóa đơn
  selectTab(index: number) {
    this.selectedTab = index;
  }

  // Tạo hóa đơn mới
  // createInvoice() {
  //   this.invoices.push(this.invoices.length + 1);
  //   this.selectedTab = this.invoices.length - 1;
  // }

  // Xóa hóa đơn
  removeInvoice(index: number, event: Event) {
    event.stopPropagation();
    if (this.invoices.length > 1) {
      this.invoices.splice(index, 1);
      this.selectedTab = this.invoices.length - 1;
    }
  }


  // Xác nhận thanh toán
  checkout() {
    if (this.cart.length === 0) {
      alert('Giỏ hàng đang trống!');
      return;
    }

    alert(`Thanh toán thành công bằng ${this.selectedPaymentMethod.toUpperCase()}!`);
    this.cart = [];
    this.discountCode = '';
    this.discountAmount = 0;
  }
}
