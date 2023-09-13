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
  company: any,
  managers: any,
  employees: any,
  meetingTitle: string,
  startDate: any,
  startTime: any,
  status: any,
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
  allCompanyCount: any;
  companyId: any;
  companyName: any;
  contractDate: any;
  meetingArray: any = new MatTableDataSource();

  constructor(
    private dashboardService: DashboardService,
    private companyService: CompanyService,
    private route: ActivatedRoute
  ) {
    this.companyId = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.getAllCompanyCount();
    this.getMeetingInfo();
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
  getMeetingInfo() {
    this.dashboardService.getMeetingInfo(this.companyId).subscribe({
      next: (res: any) => {
        console.log(res);
        this.meetingArray = new MatTableDataSource<PeriodicElement>(
          res.meetingList
        );
        console.log(this.meetingArray);
      },
      error: (err: any) => {
        console.error(err);
      },
    });
  }
}
