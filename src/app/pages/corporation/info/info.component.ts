import { Component, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { DashboardService } from 'src/app/services/dashboard.service';
import { CompanyService } from 'src/app/services/company.service';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialsModule],
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
})
export class InfoComponent {
  allCompanyCount: any;
  companyId: any;
  companyName: any;
  contractDate: any;

  constructor(
    private dashboardService: DashboardService,
    private companyService: CompanyService,
    private route: ActivatedRoute
  ) {
    this.companyId = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.getAllCompanyCount();
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
}
