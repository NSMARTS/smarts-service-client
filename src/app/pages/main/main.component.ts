import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { DashboardService } from 'src/app/services/dashboard.service';

export interface PeriodicElement {
  payDay: string;
  content: string;
  companyName: string;
}

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialsModule],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns: string[] = ['date', 'content', 'company', 'detail'];
  displayedColumns2: string[] = ['countryName', 'detail'];
  allCount: any;
  allList: any = new MatTableDataSource();
  allCountry: any;
  allCountryCount: any;

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getAllCount();
    this.getAllList();
    this.getAllCountry();
  }

  // 모든 개수 조회
  getAllCount() {
    this.dashboardService.getAllCount().subscribe({
      next: (res: any) => {
        console.log(res);
        this.allCount = res.data;
      },
      error: (err: any) => {
        console.error(err);
      },
    });
  }

  // 모든 리스트 조회
  getAllList() {
    this.dashboardService.getAllList().subscribe({
      next: (res: any) => {
        console.log(res);
        this.allList = new MatTableDataSource<PeriodicElement>(res.data);
        this.allList.paginator = this.paginator;
        console.log(this.allList);
      },
      error: (err: any) => {
        console.error(err);
      },
    });
  }

  // 모든 개수 조회
  getAllCountry() {
    this.dashboardService.getAllCountry().subscribe({
      next: (res: any) => {
        console.log(res);
        this.allCountry = res.data;
        this.allCountryCount = res.count;
      },
      error: (err: any) => {
        console.error(err);
      },
    });
  }

  selectHoliday(countryId: any) {
    console.log(countryId);
    this.router.navigate(['/country/' + countryId]);
  }
}
