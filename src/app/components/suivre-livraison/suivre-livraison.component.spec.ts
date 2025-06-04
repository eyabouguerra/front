import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuivreLivraisonComponent } from './suivre-livraison.component';

describe('SuivreLivraisonComponent', () => {
  let component: SuivreLivraisonComponent;
  let fixture: ComponentFixture<SuivreLivraisonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SuivreLivraisonComponent]
    });
    fixture = TestBed.createComponent(SuivreLivraisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
