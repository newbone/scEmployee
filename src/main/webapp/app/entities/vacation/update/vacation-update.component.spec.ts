jest.mock('@angular/router');

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { VacationService } from '../service/vacation.service';
import { IVacation, Vacation } from '../vacation.model';

import { VacationUpdateComponent } from './vacation-update.component';

describe('Component Tests', () => {
  describe('Vacation Management Update Component', () => {
    let comp: VacationUpdateComponent;
    let fixture: ComponentFixture<VacationUpdateComponent>;
    let activatedRoute: ActivatedRoute;
    let vacationService: VacationService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        declarations: [VacationUpdateComponent],
        providers: [FormBuilder, ActivatedRoute],
      })
        .overrideTemplate(VacationUpdateComponent, '')
        .compileComponents();

      fixture = TestBed.createComponent(VacationUpdateComponent);
      activatedRoute = TestBed.inject(ActivatedRoute);
      vacationService = TestBed.inject(VacationService);

      comp = fixture.componentInstance;
    });

    describe('ngOnInit', () => {
      it('Should update editForm', () => {
        const vacation: IVacation = { id: 456 };

        activatedRoute.data = of({ vacation });
        comp.ngOnInit();

        expect(comp.editForm.value).toEqual(expect.objectContaining(vacation));
      });
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', () => {
        // GIVEN
        const saveSubject = new Subject<HttpResponse<Vacation>>();
        const vacation = { id: 123 };
        jest.spyOn(vacationService, 'update').mockReturnValue(saveSubject);
        jest.spyOn(comp, 'previousState');
        activatedRoute.data = of({ vacation });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.next(new HttpResponse({ body: vacation }));
        saveSubject.complete();

        // THEN
        expect(comp.previousState).toHaveBeenCalled();
        expect(vacationService.update).toHaveBeenCalledWith(vacation);
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', () => {
        // GIVEN
        const saveSubject = new Subject<HttpResponse<Vacation>>();
        const vacation = new Vacation();
        jest.spyOn(vacationService, 'create').mockReturnValue(saveSubject);
        jest.spyOn(comp, 'previousState');
        activatedRoute.data = of({ vacation });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.next(new HttpResponse({ body: vacation }));
        saveSubject.complete();

        // THEN
        expect(vacationService.create).toHaveBeenCalledWith(vacation);
        expect(comp.isSaving).toEqual(false);
        expect(comp.previousState).toHaveBeenCalled();
      });

      it('Should set isSaving to false on error', () => {
        // GIVEN
        const saveSubject = new Subject<HttpResponse<Vacation>>();
        const vacation = { id: 123 };
        jest.spyOn(vacationService, 'update').mockReturnValue(saveSubject);
        jest.spyOn(comp, 'previousState');
        activatedRoute.data = of({ vacation });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.error('This is an error!');

        // THEN
        expect(vacationService.update).toHaveBeenCalledWith(vacation);
        expect(comp.isSaving).toEqual(false);
        expect(comp.previousState).not.toHaveBeenCalled();
      });
    });
  });
});
