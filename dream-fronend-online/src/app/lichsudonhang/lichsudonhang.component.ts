import { Component,OnInit  } from '@angular/core';
import { LichsudonhangService } from './lichsudonhang.service'; 
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-lichsudonhang',
  imports: [CommonModule],
  templateUrl: './lichsudonhang.component.html',
  styleUrl: './lichsudonhang.component.css'
})
export class LichsudonhangComponent {
  hoaDonChiTiet: any[] = [];  // Array to store fetched data
  errorMessage: string = '';  // To store error message if any

  constructor(private lichsudonhangService: LichsudonhangService, private router: Router) { }

  ngOnInit(): void {
    // Call the service method when the component is initialized
    this.lichsudonhangService.getHoaDonChiTiet().subscribe({
      next: (data) => {
        this.hoaDonChiTiet = this.processHoaDonData(data);
      
        console.log(this.hoaDonChiTiet);
      },
      error: (error) => {
        this.errorMessage = 'Error fetching data';  // Store error message if there's any
        console.error('There was an error!', error);
      }
    });
  }

  processHoaDonData(data: any[]): any[] {
    const groupedData: { [key: string]: any } = {};  // Object to store grouped invoices by idHoaDon

    // Group data by idHoaDon and sum quantities for duplicate entries
    data.forEach(item => {
      const id = item.idHoaDon;
      if (groupedData[id]) {
        groupedData[id].soLuong += item.soLuong;  // Sum quantity
      } else {
        groupedData[id] = { ...item };  // Copy item to groupedData if not already there
      }
    });

    // Convert the grouped data object back to an array
    return Object.values(groupedData).sort((a, b) => b.idHoaDon - a.idHoaDon);
  }

  viewInvoiceDetail(maHoaDon: string): void {
    this.router.navigate(['/chitietlichsu', maHoaDon]); // Navigate to chitietlichsu with the maHoaDon as a route parameter
  }

  goHome(): void {
    console.log('Quay về trang chủ...');
    window.location.href = '/banhang';  // Giả sử trang chủ là '/home'
  }
}
