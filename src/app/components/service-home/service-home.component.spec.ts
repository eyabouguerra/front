import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceHomeComponent } from './service-home.component';

describe('ServiceHomeComponent', () => {
  let component: ServiceHomeComponent;
  let fixture: ComponentFixture<ServiceHomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ServiceHomeComponent]
    });
    fixture = TestBed.createComponent(ServiceHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
