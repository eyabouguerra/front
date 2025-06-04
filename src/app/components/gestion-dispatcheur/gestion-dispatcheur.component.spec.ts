import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionDispatcheurComponent } from './gestion-dispatcheur.component';

describe('GestionDispatcheurComponent', () => {
  let component: GestionDispatcheurComponent;
  let fixture: ComponentFixture<GestionDispatcheurComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GestionDispatcheurComponent]
    });
    fixture = TestBed.createComponent(GestionDispatcheurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
