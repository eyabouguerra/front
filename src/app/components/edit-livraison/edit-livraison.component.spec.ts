import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLivraisonComponent } from './edit-livraison.component';

describe('EditLivraisonComponent', () => {
  let component: EditLivraisonComponent;
  let fixture: ComponentFixture<EditLivraisonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditLivraisonComponent]
    });
    fixture = TestBed.createComponent(EditLivraisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
