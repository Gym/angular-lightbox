import { ReplaySubject } from 'rxjs';
import { Injectable } from '@angular/core';

export interface LightboxEvent {
  type: string;
  [otherProp: string]: unknown;
}
@Injectable()
export class EventService {
  emitter: ReplaySubject<LightboxEvent> = new ReplaySubject(1);

  emitChangeEvent(data: LightboxEvent) {
    this.emitter.next(data);
  }
}
