import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import * as dayjs from 'dayjs';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';

import { IVacation, Vacation } from '../vacation.model';
import { VacationService } from '../service/vacation.service';

@Component({
  selector: 'jhi-vacation-update',
  templateUrl: './vacation-update.component.html',
})
export class VacationUpdateComponent implements OnInit {
  isSaving = false;

  editForm = this.fb.group({
    id: [],
    startDate: [],
    endDate: [],
  });

  constructor(protected vacationService: VacationService, protected activatedRoute: ActivatedRoute, protected fb: FormBuilder) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ vacation }) => {
      if (vacation.id === undefined) {
        const today = dayjs().startOf('day');
        vacation.startDate = today;
        vacation.endDate = today;
      }

      this.updateForm(vacation);
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const vacation = this.createFromForm();
    if (vacation.id !== undefined) {
      this.subscribeToSaveResponse(this.vacationService.update(vacation));
    } else {
      this.subscribeToSaveResponse(this.vacationService.create(vacation));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IVacation>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe(
      () => this.onSaveSuccess(),
      () => this.onSaveError()
    );
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(vacation: IVacation): void {
    this.editForm.patchValue({
      id: vacation.id,
      startDate: vacation.startDate ? vacation.startDate.format(DATE_TIME_FORMAT) : null,
      endDate: vacation.endDate ? vacation.endDate.format(DATE_TIME_FORMAT) : null,
    });
  }

  protected createFromForm(): IVacation {
    return {
      ...new Vacation(),
      id: this.editForm.get(['id'])!.value,
      startDate: this.editForm.get(['startDate'])!.value ? dayjs(this.editForm.get(['startDate'])!.value, DATE_TIME_FORMAT) : undefined,
      endDate: this.editForm.get(['endDate'])!.value ? dayjs(this.editForm.get(['endDate'])!.value, DATE_TIME_FORMAT) : undefined,
    };
  }
}
