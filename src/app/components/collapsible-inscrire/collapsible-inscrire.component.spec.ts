import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollapsibleInscrireComponent } from './collapsible-inscrire.component';

describe('CollapsibleInscrireComponent', () => {
  let component: CollapsibleInscrireComponent;
  let fixture: ComponentFixture<CollapsibleInscrireComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CollapsibleInscrireComponent]
    });
    fixture = TestBed.createComponent(CollapsibleInscrireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
