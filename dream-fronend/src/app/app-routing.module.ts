import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NhanvienComponent } from './nhanvien/nhanvien.component';
import { VoucherComponent } from './voucher/voucher.component'
const routes: Routes = [
  { path: 'nhanvien', component: NhanvienComponent },
 
  { path: 'voucher', component: VoucherComponent },
  { path: '', redirectTo: '/voucher', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  
})
export class AppRoutingModule {}