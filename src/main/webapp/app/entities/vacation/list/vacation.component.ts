import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IVacation } from '../vacation.model';
import { VacationService } from '../service/vacation.service';
import { VacationDeleteDialogComponent } from '../delete/vacation-delete-dialog.component';

@Component({
  selector: 'jhi-vacation',
  templateUrl: './vacation.component.html',
})
export class VacationComponent implements OnInit {
  vacations?: IVacation[];
  isLoading = false;
  currentSearch: string;

  constructor(protected vacationService: VacationService, protected modalService: NgbModal, protected activatedRoute: ActivatedRoute) {
    this.currentSearch = this.activatedRoute.snapshot.queryParams['search'] ?? '';
  }

  loadAll(): void {
    this.isLoading = true;
    if (this.currentSearch) {
      this.vacationService
        .search({
          query: this.currentSearch,
        })
        .subscribe(
          (res: HttpResponse<IVacation[]>) => {
            this.isLoading = false;
            this.vacations = res.body ?? [];
          },
          () => {
            this.isLoading = false;
          }
        );
      return;
    }

    this.vacationService.query().subscribe(
      (res: HttpResponse<IVacation[]>) => {
        this.isLoading = false;
        this.vacations = res.body ?? [];
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  search(query: string): void {
    this.currentSearch = query;
    this.loadAll();
  }

  ngOnInit(): void {
    this.loadAll();
  }

  trackId(index: number, item: IVacation): number {
    return item.id!;
  }

  delete(vacation: IVacation): void {
    const modalRef = this.modalService.open(VacationDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.vacation = vacation;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed.subscribe(reason => {
      if (reason === 'deleted') {
        this.loadAll();
      }
    });
  }
}
