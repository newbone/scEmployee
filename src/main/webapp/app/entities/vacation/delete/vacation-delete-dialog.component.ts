import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IVacation } from '../vacation.model';
import { VacationService } from '../service/vacation.service';

@Component({
  templateUrl: './vacation-delete-dialog.component.html',
})
export class VacationDeleteDialogComponent {
  vacation?: IVacation;

  constructor(protected vacationService: VacationService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.vacationService.delete(id).subscribe(() => {
      this.activeModal.close('deleted');
    });
  }
}
