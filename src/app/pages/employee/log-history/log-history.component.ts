import { CommonService } from './../../../services/common/common.service';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MaterialsModule } from 'src/app/materials/materials.module';
import * as moment from 'moment';

@Component({
  selector: 'app-log-history',
  standalone: true,
  imports: [CommonModule, MaterialsModule, ReactiveFormsModule],
  templateUrl: './log-history.component.html',
  styleUrls: ['./log-history.component.scss']
})
export class LogHistoryComponent {
  // Dependency inject
  private fb = inject(FormBuilder)
  private commonService = inject(CommonService)


  filteredEmployee = signal<any[]>([]); // 자동완성에 들어갈 emploeeList

  destroyRef = inject(DestroyRef);

  displayedColumns: string[] = [
    'employee',
    'userId',
    'email',
    'name',
    'lastEnterTime',
    'total_num',
  ];

  dataSource = new MatTableDataSource<any>([]);
  searchLeaveStatusForm: FormGroup;


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;
  resultsLength = 0;


  constructor() {
    // 이번 달 기준 첫째날
    const startOfMonth = moment().startOf('month').format();
    // 이번 달 기준 마지막날
    const endOfMonth = moment().endOf('month').format();
    this.searchLeaveStatusForm = this.fb.group({
      emailFormControl: new FormControl(''),
      leaveStartDate: new FormControl(startOfMonth),
      leaveEndDate: new FormControl(endOfMonth),
      leaveType: new FormControl('all'),
    });
  }


  userSearch() {

  }
}
