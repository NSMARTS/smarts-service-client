import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
//table page
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
// import { DialogService } from 'src/@dw/dialog/dialog.service';
import { Subject } from 'rxjs';
import { CompanyService } from 'src/app/services/leave/company/company.service';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { CommonModule } from '@angular/common';

// view table
export interface PeriodicElement {
  Name: string;
  position: string;
  location: string;
  annual_leave: number;
  sick_leave: number;
  replacement: number;
  start_date: Date;
  end_date: Date;
  tenure_today: Date;
  tenure_end: Date;
}

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  //   standalone: true,
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.scss'],
})
export class CompanyListComponent implements OnInit {
  displayedColumns: string[] = [
    'code',
    'name',
    'rollover',
    'rollover_max_month',
    'rollover_max_day',
    'btns',
  ];
  filterValues: any = {};
  filterSelectObj: any = [];
  company_max_day: any;

  companyList: any = new MatTableDataSource();

  myRank = window.location.pathname.split('/')[3];
  managerName = '';
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  private unsubscribe$ = new Subject<void>();
  isRollover = false;
  constructor(
    private router: Router,
    private companyService: CompanyService
  ) // public dialogService: DialogService
  {
    this.filterSelectObj = [
      {
        name: 'Code',
        columnProp: 'company_code',
        options: [],
      },
      // {
      //   name: 'NAME',
      //   columnProp: 'name',
      //   options: []
      // }, {
      //   name: 'USERNAME',
      //   columnProp: 'username',
      //   options: []
      // }, {
      //   name: 'EMAIL',
      //   columnProp: 'email',
      //   options: []
      // }, {
      //   name: 'STATUS',
      //   columnProp: 'status',
      //   options: []
      // }
    ];
  }

  ngOnInit(): void {
    // this.dataService.userCompanyProfile.pipe(takeUntil(this.unsubscribe$)).subscribe(
    // 	(data: any) => {
    // 		this.company_max_day = data.rollover_max_day
    // 		if(this.company_max_day != undefined){
    // 			this.isRollover = true;
    // 			this.displayedColumns = ['code', 'name', 'rollover', 'rollover_max_month', 'rollover_max_day', 'btns'];
    // 		}
    // 		this.getMyEmployeeLists();
    // })
    if (this.company_max_day != undefined) {
      this.isRollover = true;
      this.displayedColumns = [
        'code',
        'name',
        'rollover',
        'rollover_max_month',
        'rollover_max_day',
        'btns',
      ];
    }
    this.getCompanyList();
  }

  getCompanyList() {
    this.companyService.getCompanyList().subscribe((data: any) => {
      console.log(data);
      this.companyList = data.getCompany;
      this.companyList = new MatTableDataSource<PeriodicElement>(
        data.getCompany
      );
      this.companyList.paginator = this.paginator;
    });
  }

  ngOnDestroy() {
    // unsubscribe all subscription
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  backManagerList() {
    this.router.navigate(['employee/manager-list']);
  }

  //////////////////////////////
  // Get Uniqu values from columns to build filter
  getFilterObject(fullObj: any, key: any) {
    const uniqChk: any = [];
    fullObj.filter((obj: any) => {
      if (!uniqChk.includes(obj[key])) {
        uniqChk.push(obj[key]);
      }
      return obj;
    });
    return uniqChk;
  }

  // Called on Filter change
  filterChange(filter: any, event: any) {
    //let filterValues = {}
    this.filterValues[filter.columnProp] = event.target.value
      .trim()
      .toLowerCase();
    this.companyList.filter = JSON.stringify(this.filterValues);
  }

  // Custom filter method fot Angular Material Datatable
  createFilter() {
    let filterFunction = function (data: any, filter: string): boolean {
      let searchTerms = JSON.parse(filter);
      let isFilterSet = false;
      for (const col in searchTerms) {
        if (searchTerms[col].toString() !== '') {
          isFilterSet = true;
        } else {
          delete searchTerms[col];
        }
      }
      let nameSearch = () => {
        let found = false;
        if (isFilterSet) {
          for (const col in searchTerms) {
            searchTerms[col]
              .trim()
              .toLowerCase()
              .split(' ')
              .forEach((word: any) => {
                if (
                  data[col].toString().toLowerCase().indexOf(word) != -1 &&
                  isFilterSet
                ) {
                  found = true;
                }
              });
          }
          return found;
        } else {
          return true;
        }
      };
      return nameSearch();
    };
    return filterFunction;
  }

  // Reset table filters
  resetFilters() {
    this.filterValues = {};
    this.filterSelectObj.forEach((value: any, key: any) => {
      value.modelValue = undefined;
    });
    this.companyList.filter = '';
  }

  // 회사 추가
  addCompany() {
    this.router.navigate(['company/company-add']);
  }

  // 회사 수정
  editCompany(id: any) {
    this.router.navigate(['company/company-edit/' + id]);
  }

  // 회사 삭제
  //   deleteCompany(id: any) {
  //     this.dialogService
  //       .openDialogConfirm('Do you delete this company?')
  //       .subscribe((result: any) => {
  //         if (result) {
  //           // 회사 삭제
  //           this.companyService.deleteCompany({ _id: id }).subscribe(
  //             (data: any) => {
  //               if (data.message == 'delete company') {
  //                 this.dialogService.openDialogPositive(
  //                   'Successfully, the company has been delete.'
  //                 );
  //                 this.getCompanyList();
  //               }
  //             },
  //             (err: any) => {
  //               console.log(err);
  //               this.dialogService.openDialogNegative(err.error.message);
  //               // alert(err.error.message);
  //             }
  //           );
  //         }
  //       });
  //   }
}
