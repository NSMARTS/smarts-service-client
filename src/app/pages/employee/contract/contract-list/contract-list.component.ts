import { Component, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as moment from 'moment';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { EmployeeService } from 'src/app/services/employee.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from 'src/app/services/dialog.service';
import { Employee } from 'src/app/interfaces/employee.interface';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-contract-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.scss']
})
export class ContractListComponent {
  companyId: string;
  employees: WritableSignal<Employee[]>
  searchContractForm: FormGroup;

  dataSource: MatTableDataSource<Employee> = new MatTableDataSource<Employee>([]);


  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private dialogService: DialogService
  ) {
    // 이번 달 기준 첫째날
    const startOfMonth = moment().startOf('month').format();
    // 이번 달 기준 마지막날
    const endOfMonth = moment().endOf('month').format();

    this.companyId = this.route.snapshot.params['id'];
    // 상태저장된 employee 리스트 불러오기
    this.employees = this.employeeService.employees;

    this.searchContractForm = this.fb.group({
      emailFormControl: new FormControl(''),
      uploadStartDate: new FormControl(startOfMonth),
      uploadEndDate: new FormControl(endOfMonth),
      leaveType: new FormControl('all'),
    });
  }

}
