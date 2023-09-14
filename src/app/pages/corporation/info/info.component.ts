import { Component, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { DashboardService } from 'src/app/services/dashboard.service';
import { CompanyService } from 'src/app/services/company.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

// view table
export interface PeriodicElement {
  _id: any,
  meetingTitle: string,
  startDate: any,
  startTime: any,
}

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialsModule],
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
})
export class InfoComponent {
  displayedColumns: string[] = ['date', 'content'];
  toggleValue: any = 'all';
  toggleList: any = new MatTableDataSource();
  allList: any[] = [];
  allCompanyCount: any;
  companyId: any;
  companyName: any;
  contractDate: any;
  paginator: any;

  constructor(
    private dashboardService: DashboardService,
    private route: ActivatedRoute
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

  // 미팅 정보 가져오기
  getAllList() {
    this.dashboardService.getMeetingInfo(this.companyId).subscribe({
      next: (res: any) => {
        console.log(res);
        this.allList = res.meetingList;
        console.log(this.allList);

        this.toggleList = new MatTableDataSource<PeriodicElement>();
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
        this.toggleList = this.allList;
        break;
      case 'meeting':
        this.toggleList = this.allList.filter(
          (item) => item.type === 'meeting'
        );
        break;
      case 'notice':
        //this.toogleList = this.allList.filter(
        //    (item) => item.type === 'notice'
        //  );
        break;
      default:
        this.toggleList = [];
        break;
    }
  }
}
