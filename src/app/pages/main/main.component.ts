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
  }
  ngAfterViewInit() {
    this.getAllCount();
    this.getAllList();
    this.getAllCountry();
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
      next: async (res: any) => {
        console.log(res);
        //date 최신이 가장 위로 오도록 정렬
        this.allList = await res.allList
          // map 에서 filter로 변경. 조건문과 일치하지 않으면 배열에서 제거
          .filter((item: any) => {
            if (item.type !== 'pay') {
              return item
            }
            // type이 pay인 경우 date는 급여"일자"만 오기 때문에 Full Date로 변환처리해야함
            // 편의상 작년 12월 ~ 올해 12개월 ~ 내년 1월 월급일을 모두 생성하고
            // 현재 +7, -7 구간에 해당하는 날짜를 선택하여 date를 update함
            else if (item.type === 'pay') {
              let payDateAll = [];
              let payDate = item.date;

              // 작년 12월 월급날
              payDateAll[0] = moment()
                .subtract(1, 'years')
                .set('month', 11)
                .set('date', payDate)
                .startOf('day')
                .toDate(); // 작년 12월
              // 올해 12개월 월급날
              for (let month = 1; month <= 12; month++) {
                // 월별 일자를 고려한 payDate 계산
                payDate = Math.min(item.date, moment().daysInMonth());
                payDateAll[month] = moment()
                  .set('month', month - 1)
                  .set('date', payDate)
                  .startOf('day')
                  .toDate(); // 올해 1~12월
              }
              // 내년 1월 월급날
              payDate = item.date;
              payDateAll[13] = moment()
                .add(1, 'years')
                .set('month', 0)
                .set('date', payDate)
                .startOf('day')
                .toDate(); // 내년 1월

              // 해당 구간의 급여일 날짜 찾기
              // + - 7일 내에 현재 급여일이 어느 날짜에 해당하는지 찾기
              let oneWeekAgo = moment().subtract(7, 'd').startOf('day').toDate();
              let oneWeekLater = moment().add(7, 'd').endOf('day').toDate();
              let isPayDateWithinRange = false;
              // 현재 구간에 해당하는 실제 월급일 찾기
              for (let payDateItem of payDateAll) {
                if (oneWeekAgo <= payDateItem && payDateItem <= oneWeekLater) {
                  item.date = payDateItem;
                  isPayDateWithinRange = true;
                  break;
                }
              }
              // 왠지는 모르겟는데 type === 'Pay' 면서 
              // 급여일 기준 +-7 날짜에 포함되지 않는데도 값이 서버에서 온다.
              // 우선 그런 데이터가 나올 경우 안보이게 return 한다. 
              return isPayDateWithinRange; // 현재 구간 내 급여일이 있으면 true, 없으면 false 반환

            }

          }
          )
          .sort(
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
