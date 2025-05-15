import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CamionsComponent } from './camions.component';

describe('CamionsComponent', () => {
  let component: CamionsComponent;
  let fixture: ComponentFixture<CamionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CamionsComponent]
    });
    fixture = TestBed.createComponent(CamionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
