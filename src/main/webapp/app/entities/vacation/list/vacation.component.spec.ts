jest.mock('@angular/router');

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { VacationService } from '../service/vacation.service';

import { VacationComponent } from './vacation.component';

describe('Component Tests', () => {
  describe('Vacation Management Component', () => {
    let comp: VacationComponent;
    let fixture: ComponentFixture<VacationComponent>;
    let service: VacationService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        declarations: [VacationComponent],
        providers: [
          {
            provide: ActivatedRoute,
            useValue: { snapshot: { queryParams: {} } },
          },
        ],
      })
        .overrideTemplate(VacationComponent, '')
        .compileComponents();

      fixture = TestBed.createComponent(VacationComponent);
      comp = fixture.componentInstance;
      service = TestBed.inject(VacationService);

      const headers = new HttpHeaders().append('link', 'link;link');
      jest.spyOn(service, 'query').mockReturnValue(
        of(
          new HttpResponse({
            body: [{ id: 123 }],
            headers,
          })
        )
      );
    });

    it('Should call load all on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(service.query).toHaveBeenCalled();
      expect(comp.vacations?.[0]).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
