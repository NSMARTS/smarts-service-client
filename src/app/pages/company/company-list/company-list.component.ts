
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountryService } from 'src/app/services/country.service';
import { CompanyService } from 'src/app/services/company.service';

@Component({
    selector: 'app-company-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './company-list.component.html',
    styleUrls: ['./company-list.component.scss']
})
export class CompanyListComponent implements OnInit {
    companies = []
    companyService = inject(CompanyService)
    ngOnInit() {
        this.companyService.getCountries().subscribe({
            next: (res: any) => {
                this.companies = res
            },
            error: (e) => console.error(e)
        })
    }
}
