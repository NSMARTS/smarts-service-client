import { QuillModule } from 'ngx-quill';
import { AfterViewInit, Component, DestroyRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, UntypedFormControl, Validators } from '@angular/forms';
import { map, merge, startWith, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'src/app/services/dialog.service';
import { NotificationService } from 'src/app/services/notification.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: [
    './notification-list.component.scss',
    '../../../../../../node_modules/quill/dist/quill.snow.css'
  ]
})
export class NotificationListComponent implements AfterViewInit {

  companyId!: string;

  // ['전체','일반 공지', '회의 공지', '급여 공지', '정책 변경 공지', '기타...']
  categoryList = ['All', 'Notice', 'Meeting', 'Pay', 'Policy', 'Issue', 'Etc']
  selectedCategory: string = 'All';

  searchConditionList = ['title', 'writer']

  searchNotificationForm: FormGroup;

  // filtered

  dataSource = new MatTableDataSource<Notification>([]);

  displayedColumns: string[] = [
    'category',
    'title',
    'writer',
    'createdAt',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;
  resultsLength = 0;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private notificationService: NotificationService,
    private commonService: CommonService,
  ) {

    // 이번 달 기준 첫째날 
    const startOfMonth = moment().startOf('month').format();
    // 이번 달 기준 마지막날
    const endOfMonth = moment().endOf('month').format();


    this.companyId = this.route.snapshot.params['id'];

    this.searchNotificationForm = this.fb.group({
      // title, writer
      searchCondition: new FormControl('title', [Validators.required]),
      // 검색할 내용
      searchConditionValue: new FormControl(''),
      category: new FormControl('All', [Validators.required]),
      startDate: new FormControl(startOfMonth),
      endDate: new FormControl(endOfMonth),
      company: this.companyId
    });
  }

  ngOnInit() {
    // this.getNotifications();

  }
  ngAfterViewInit(): void {
    this.getNotifications('All');

  }

  getNotifications(category: string) {

    this.selectedCategory = category;

    const convertedStartDate = this.commonService.dateFormatting(
      this.searchNotificationForm.controls['startDate'].value
    );
    // 검색 범위 마지막 일을 YYYY-MM-DD 포맷으로 변경
    const convertedEndDate = this.commonService.dateFormatting(
      this.searchNotificationForm.controls['endDate'].value
    );

    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          // this.isLoadingResults = true;
          const paramsQuery = {
            ...this.searchNotificationForm.value,
            startDate: convertedStartDate,
            endDate: convertedEndDate,
            active: this.sort.active,
            direction: this.sort.direction,
            pageIndex: this.paginator.pageIndex,
            pageSize: this.paginator.pageSize,
            category: category
          }

          return this.notificationService.getNotifications(this.companyId, paramsQuery).pipe()

        }),
        map((res: any) => {
          console.log(res)
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.isRateLimitReached = res.data === null;
          this.resultsLength = res.total_count;
          this.dataSource = new MatTableDataSource<any>(res.data);
          return res.data;
        })
      )
      .subscribe();

  }

}
