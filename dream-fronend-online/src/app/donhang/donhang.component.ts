import { Component } from '@angular/core';
import { HoadonService } from '../hoadon/hoadon.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-donhang',
  imports: [CommonModule],
  templateUrl: './donhang.component.html',
  styleUrl: './donhang.component.css'
})
export class DonhangComponent {
  hoaDonData: any;

  constructor(private hoadonService: HoadonService) {}

  ngOnInit(): void {
    this.hoadonService.getHoaDonData().subscribe((data) => {
      if (data) {
        this.hoaDonData = data;
        console.log('Dữ liệu hóa đơn nhận được:', this.hoaDonData);
      }
    });
  }
}
