import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduitsParTypeComponent } from './produits-par-type.component';

describe('ProduitsParTypeComponent', () => {
  let component: ProduitsParTypeComponent;
  let fixture: ComponentFixture<ProduitsParTypeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProduitsParTypeComponent]
    });
    fixture = TestBed.createComponent(ProduitsParTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
