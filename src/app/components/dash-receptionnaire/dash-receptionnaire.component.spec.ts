import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashReceptionnaireComponent } from './dash-receptionnaire.component';

describe('DashReceptionnaireComponent', () => {
  let component: DashReceptionnaireComponent;
  let fixture: ComponentFixture<DashReceptionnaireComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashReceptionnaireComponent]
    });
    fixture = TestBed.createComponent(DashReceptionnaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
