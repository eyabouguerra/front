import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategorieUserComponent } from './categorie-user.component';

describe('CategorieUserComponent', () => {
  let component: CategorieUserComponent;
  let fixture: ComponentFixture<CategorieUserComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CategorieUserComponent]
    });
    fixture = TestBed.createComponent(CategorieUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
