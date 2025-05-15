import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogLivraisonDetailsComponent } from './dialog-livraison-details.component';

describe('DialogLivraisonDetailsComponent', () => {
  let component: DialogLivraisonDetailsComponent;
  let fixture: ComponentFixture<DialogLivraisonDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogLivraisonDetailsComponent]
    });
    fixture = TestBed.createComponent(DialogLivraisonDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
