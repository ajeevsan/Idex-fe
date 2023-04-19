import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PastGraphDataComponent } from './past-graph-data.component';

describe('PastGraphDataComponent', () => {
  let component: PastGraphDataComponent;
  let fixture: ComponentFixture<PastGraphDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PastGraphDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PastGraphDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
