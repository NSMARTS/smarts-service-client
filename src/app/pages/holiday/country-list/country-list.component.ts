import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
// import { DialogService } from 'src/app/dialog/dialog.service';
import { CountryService } from 'src/app/services/leave/country/country.service';
import { DataService } from 'src/app/stores/data/data.service';
import { CountryAddComponent } from '../country-add/country-add.component';
import { CountryHolidayAddComponent } from '../country-holiday-add/country-holiday-add.component';
import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { DialogService } from 'src/app/dialog/dialog.service';

// view table
export interface PeriodicElement {
  countryName: string;
  countryCode: string;
  btns: any;
}

@Component({
  selector: 'app-country-list',
  standalone: true,
  imports: [
    CommonModule,
    MaterialsModule,
    RouterModule,
    MatPaginatorModule,
    MatTableModule,
  ],
  templateUrl: './country-list.component.html',
  styleUrls: ['./country-list.component.scss'],
})
export class CountryListComponent implements OnInit {
  // @ViewChild 데코레이터는 Angular 컴포넌트에서 템플릿이나 다른 컴포넌트의 자식 요소를 가져오기 위해 사용되는 기능
  @ViewChild(MatPaginator) paginator!: MatPaginator; // '!'를 사용하여 초기화될 것임을 TypeScript에 알립니다. 변수가 절대로 null 또는 undefined가 될 수 없다고 단언하는 역할을 합니다. 즉, paginator 변수는 MatPaginator 인스턴스를 가리키며, null일 수 없음을 보장
  // view table
  displayedColumns: string[] = ['countryName', 'countryCode', 'btns'];
  // dataSource = ELEMENT_DATA;
  private unsubscribe$ = new Subject<void>();
  // $ 기호는 관례적으로 옵저버블 변수를 식별하기 위해 붙이는 표기법
  //  subscribe 의 기능은 내가 바라보고있는 주제에 대해서 어떠한 이벤트가 발생함에 따라서 그 행위를 처리하는 함수이다.

  // replacement day requests
  countryInfo: any;
  countryList: any;
  company: any;
  manager: any;
  userInfo: any;

  constructor(
    public dataService: DataService,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private countryService: CountryService
  ) {}

  // takeUntil은 연산자에 Observable를 넘겨 미러링을 한뒤 넘겨준 Observable이 데이터를 받거나 완료처리가 되면 미러링을 중단하고 처음 Observable은 구독취소가 됩니다.
  ngOnInit(): void {
    this.dataService.userProfile.pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (data: any) => {  
        this.userInfo = data;
      }, 
      error: (err: any) => {
        console.log(err);
      },
    });
    this.getCountryList();
  }

  openAddCountry() {
    const dialogRef = this.dialog.open(CountryAddComponent);

    dialogRef.afterClosed().subscribe((result) => {
      this.getCountryList();
    });
  }

  deleteCountry(_id: any) {
    this.dialogService
      .openDialogConfirm('Do you want delete this country?')
      .subscribe((result: any) => {
        if (result) {
          this.countryService.deleteCountry(_id).subscribe({
            next: (data: any) => {
              if (data.message == 'Success delete country') {
                this.getCountryList();
              }
            },
            error: (err: any) => {
              this.dialogService.openDialogNegative(err.error.message);
            },
          });
        }
      });
  }

  addCountryHoliday(countryId: any) {
    const dialogRef = this.dialog.open(CountryHolidayAddComponent, {
      data: { countryId: countryId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.getCountryList();
    });
  }

  //  ngOnDestroy 메서드는 컴포넌트가 파괴될 때 호출
  ngOnDestroy() {
    // unsubscribe all subscription
    this.unsubscribe$.next(); // 옵저버블에 완료 신호를 보냄
    this.unsubscribe$.complete(); // 옵저버블을 완료시킴
  }

  getCountryList() {
    this.countryService.getCountryList().subscribe({
      next: (data: any) => {
        // console.log(data);
        if (data.message == 'getCountry') {
          this.countryList = data.getCountry;
        }
        this.countryList = new MatTableDataSource<PeriodicElement>(
          data.getCountry
        );
        this.countryList.paginator = this.paginator;
      },
      error: (err: any) => {
        console.log(err.error.message);
      },
    });
  }
}
