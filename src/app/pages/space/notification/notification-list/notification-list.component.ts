import { QuillModule } from 'ngx-quill';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { FormBuilder, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { map, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: [
    './notification-list.component.scss',
    '../../../../../../node_modules/quill/dist/quill.snow.css'
  ]
})
export class NotificationListComponent implements OnInit {


  constructor(
    private fb: FormBuilder,

  ) { }

  ngOnInit(): void {

  }

}
