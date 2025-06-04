import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompartimentsComponent } from './compartiments.component';

describe('CompartimentsComponent', () => {
  let component: CompartimentsComponent;
  let fixture: ComponentFixture<CompartimentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CompartimentsComponent]
    });
    fixture = TestBed.createComponent(CompartimentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
