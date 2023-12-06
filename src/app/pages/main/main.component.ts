import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import * as moment from 'moment';

export interface PeriodicElement {
  date: string;
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
  displayedColumns: string[] = ['date', 'chip', 'content', 'company', 'openIn'];
  displayedColumns2: string[] = ['countryName', 'openIn'];
  allCount: any;
  toggleValue: any = 'all';
  toggleList: any = new MatTableDataSource();
  allList: any[] = [];
  allCountry: any;
  allCountryCount: any;
  date = new FormControl(moment());
  ListForm!: FormGroup<any>;
  currentYear = moment().year();
  minDate: Date = new Date(this.currentYear, 0, 1);
  maxDate: Date = new Date(this.currentYear, 11, 31);

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.ListForm = this.fb.group({
      holidayName: ['', [Validators.required]],
      holidayDate: ['', [Validators.required]],
    });

    this.getAllCount();
    this.getAllList();
    this.getAllCountry();

    console.log(this.allCountry);
  }

  // 모든 개수 조회
  getAllCount() {
    this.dashboardService.getAllCount().subscribe({
      next: (res: any) => {
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
        //date 최신이 가장 위로 오도록 정렬
        this.allList = res.allList.sort(
          (a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.toggleList = new MatTableDataSource(this.allList);
        this.toggleList.paginator = this.paginator;
        this.onToggleChange();
      },
      error: (err: any) => {
        console.error(err);
      },
    });
  }

  datePickChange(dateValue: any) {
    this.ListForm.get('holidayDate')?.setValue(dateValue);
  }

  onToggleChange() {
    switch (this.toggleValue) {
      case 'all':
        this.toggleList.data = this.allList;
        this.toggleList.paginator = this.paginator;
        break;
      case 'pay':
        this.toggleList.data = this.allList.filter(
          (item) => item.type === 'pay'
        );
        this.toggleList.paginator = this.paginator;
        break;
      case 'meeting':
        this.toggleList.data = this.allList.filter(
          (item) => item.type === 'meeting'
        );
        this.toggleList.paginator = this.paginator;
        break;
      case 'notice':
        this.toggleList.data = this.allList.filter(
          (item) => item.type === 'notification'
        );
        this.toggleList.paginator = this.paginator;
        break;
      default:
        this.toggleList = [];
        break;
    }
  }

  // 모든 개수 조회
  getAllCountry() {
    this.dashboardService.getAllCountry().subscribe({
      next: (res: any) => {
        this.allCountry = res.data;
        this.allCountryCount = res.count;
      },
      error: (err: any) => {
        console.error(err);
      },
    });
  }

  onRowClick(row: any) {
    console.log(row);
    switch (row.type) {
      case 'pay':
        this.router.navigate(['/company', row.companyId, 'pay-stub']);
        break;
      case 'meeting':
        this.router.navigate(['/company', row.companyId, 'meeting']);
        break;
      case 'notification':
        this.router.navigate([
          '/company',
          row.companyId,
          'notification',
          'detail',
          row._id,
        ]);
        break;
      default:
        this.router.navigate(['/country/' + row._id], {
          queryParams: { name: row.countryName },
        });
        break;
    }
  }
}
