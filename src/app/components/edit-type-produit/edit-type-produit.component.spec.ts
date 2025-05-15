import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTypeProduitComponent } from './edit-type-produit.component';

describe('EditTypeProduitComponent', () => {
  let component: EditTypeProduitComponent;
  let fixture: ComponentFixture<EditTypeProduitComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditTypeProduitComponent]
    });
    fixture = TestBed.createComponent(EditTypeProduitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
