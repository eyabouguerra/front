import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduitUserComponent } from './produit-user.component';

describe('ProduitUserComponent', () => {
  let component: ProduitUserComponent;
  let fixture: ComponentFixture<ProduitUserComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProduitUserComponent]
    });
    fixture = TestBed.createComponent(ProduitUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
