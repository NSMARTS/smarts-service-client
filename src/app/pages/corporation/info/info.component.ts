import { Component, ViewChild, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { DashboardService } from 'src/app/services/dashboard.service';
import { CompanyService } from 'src/app/services/company.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialsModule],
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
})
export class InfoComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns: string[] = ['date', 'chip', 'content', 'enter'];
  toggleValue: any = 'all';
  toggleList: any = new MatTableDataSource();
  allList: any[] = [];
  allCompanyCount: any;
  companyId: any;
  companyName: any;
  contractDate: any;

  constructor(
    private dashboardService: DashboardService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.companyId = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.getAllCompanyCount();
    this.getAllList();
  }

  // 회사별 모든 개수 조회
  getAllCompanyCount() {
    this.dashboardService.getAllCompanyCount(this.companyId).subscribe({
      next: (res: any) => {
        console.log(res);
        this.allCompanyCount = res.data;
        this.companyName = res.company.companyName;
        this.contractDate = res.company.contractDate;
      },
      error: (err: any) => {
        console.error(err);
      },
    });
  }

  // 리스트 가져오기
  getAllList() {
    this.dashboardService.getAllListByCompany(this.companyId).subscribe({
      next: (res: any) => {
        console.log(res);
        const updatedNotificationList = res.notificationList.map(
          (item: any) => {
            return {
              ...item,
              startDate: item.createdAt, // createdAt 값을 startDate로 복사
            };
          }
        );
        console.log(updatedNotificationList);
        this.allList = [...res.meetingList, ...updatedNotificationList];

        this.allList = this.allList.sort((a: any, b: any) => {
          return (
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          );
        });

        this.toggleList = new MatTableDataSource(this.allList);
        console.log(this.toggleList);

        this.toggleList.paginator = this.paginator;
        this.onToggleChange();
      },
      error: (err: any) => {
        console.error(err);
      },
    });
  }

  onToggleChange() {
    switch (this.toggleValue) {
      case 'all':
        this.toggleList.data = this.allList;
        this.toggleList.paginator = this.paginator;
        break;
      case 'meeting':
        this.toggleList.data = this.allList.filter(
          (item) => item.type === 'meeting'
        );
        this.toggleList.paginator = this.paginator;
        break;
      case 'notification':
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

  onRowClick(row: any) {
    console.log(row);
    switch (row.type) {
      case 'meeting':
        this.router.navigate(['/company', this.companyId, 'meeting']);
        break;
      case 'notification':
        this.router.navigate([
          '/company',
          this.companyId,
          'notification',
          'detail',
          row._id,
        ]);
        break;
      default:
        this.router.navigate(['/country/' + row._id]);
        break;
    }
  }
}
