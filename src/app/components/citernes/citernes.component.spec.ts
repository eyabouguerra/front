import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CiternesComponent } from './citernes.component';

describe('CiternesComponent', () => {
  let component: CiternesComponent;
  let fixture: ComponentFixture<CiternesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CiternesComponent]
    });
    fixture = TestBed.createComponent(CiternesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
