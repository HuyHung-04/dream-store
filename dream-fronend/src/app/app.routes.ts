import {Routes} from '@angular/router';
// tạo component xong khai báo ở đây đâe hienr thị lên form
import {BanhangComponent} from './banhang/banhang.component';
import {SanphamComponent} from './sanpham/sanpham.component';
import {LayoutComponent} from './layout/layout.component';
import {KhachhangComponent} from './khachhang/khachhang.component';
import {KhuyenmaiComponent} from './khuyenmai/khuyenmai.component';
import {NhanvienComponent} from './nhanvien/nhanvien.component';
import {ThongkeComponent} from './thongke/thongke.component';
import {VoucherComponent} from './voucher/voucher.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {path: '', redirectTo: 'banhang', pathMatch: 'full'}, // Route mặc định
      {path: 'banhang', component: BanhangComponent},
      {path: 'sanpham', component: SanphamComponent},
      {path: 'voucher', component: VoucherComponent},
      {path: 'khuyenmai', component: KhuyenmaiComponent},
      {path: 'khachhang', component: KhachhangComponent},
      {path: 'nhanvien', component: NhanvienComponent},
      {path: 'thongke', component: ThongkeComponent}
    ],
  },
];

