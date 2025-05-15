import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceptionnairePageComponent } from './receptionnaire-page.component';

describe('ReceptionnairePageComponent', () => {
  let component: ReceptionnairePageComponent;
  let fixture: ComponentFixture<ReceptionnairePageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReceptionnairePageComponent]
    });
    fixture = TestBed.createComponent(ReceptionnairePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
