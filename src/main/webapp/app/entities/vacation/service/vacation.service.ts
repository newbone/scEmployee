import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as dayjs from 'dayjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { Search } from 'app/core/request/request.model';
import { IVacation, getVacationIdentifier } from '../vacation.model';

export type EntityResponseType = HttpResponse<IVacation>;
export type EntityArrayResponseType = HttpResponse<IVacation[]>;

@Injectable({ providedIn: 'root' })
export class VacationService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/vacations');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/_search/vacations');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(vacation: IVacation): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(vacation);
    return this.http
      .post<IVacation>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  update(vacation: IVacation): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(vacation);
    return this.http
      .put<IVacation>(`${this.resourceUrl}/${getVacationIdentifier(vacation) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  partialUpdate(vacation: IVacation): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(vacation);
    return this.http
      .patch<IVacation>(`${this.resourceUrl}/${getVacationIdentifier(vacation) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<IVacation>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IVacation[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: Search): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IVacation[]>(this.resourceSearchUrl, { params: options, observe: 'response' })
      .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
  }

  addVacationToCollectionIfMissing(vacationCollection: IVacation[], ...vacationsToCheck: (IVacation | null | undefined)[]): IVacation[] {
    const vacations: IVacation[] = vacationsToCheck.filter(isPresent);
    if (vacations.length > 0) {
      const vacationCollectionIdentifiers = vacationCollection.map(vacationItem => getVacationIdentifier(vacationItem)!);
      const vacationsToAdd = vacations.filter(vacationItem => {
        const vacationIdentifier = getVacationIdentifier(vacationItem);
        if (vacationIdentifier == null || vacationCollectionIdentifiers.includes(vacationIdentifier)) {
          return false;
        }
        vacationCollectionIdentifiers.push(vacationIdentifier);
        return true;
      });
      return [...vacationsToAdd, ...vacationCollection];
    }
    return vacationCollection;
  }

  protected convertDateFromClient(vacation: IVacation): IVacation {
    return Object.assign({}, vacation, {
      startDate: vacation.startDate?.isValid() ? vacation.startDate.toJSON() : undefined,
      endDate: vacation.endDate?.isValid() ? vacation.endDate.toJSON() : undefined,
    });
  }

  protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
    if (res.body) {
      res.body.startDate = res.body.startDate ? dayjs(res.body.startDate) : undefined;
      res.body.endDate = res.body.endDate ? dayjs(res.body.endDate) : undefined;
    }
    return res;
  }

  protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
    if (res.body) {
      res.body.forEach((vacation: IVacation) => {
        vacation.startDate = vacation.startDate ? dayjs(vacation.startDate) : undefined;
        vacation.endDate = vacation.endDate ? dayjs(vacation.endDate) : undefined;
      });
    }
    return res;
  }
}
