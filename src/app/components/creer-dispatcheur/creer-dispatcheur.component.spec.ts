import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreerDispatcheurComponent } from './creer-dispatcheur.component';

describe('CreerDispatcheurComponent', () => {
  let component: CreerDispatcheurComponent;
  let fixture: ComponentFixture<CreerDispatcheurComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreerDispatcheurComponent]
    });
    fixture = TestBed.createComponent(CreerDispatcheurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
