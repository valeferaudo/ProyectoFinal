import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Field } from 'src/app/models/field.model';

@Component({
  selector: 'app-field-sport-modal',
  templateUrl: './field-sport-modal.component.html',
  styleUrls: ['./field-sport-modal.component.css']
})
export class FieldSportModalComponent implements OnInit {

  @Input() hiddenModal: boolean;
  @Input() mode: 'create' | 'update';
  @Input() fieldSelected: Field;
  @Input() sportCenterID: string;
  @Output() closeModal = new EventEmitter<string>();
  @Output() getFields = new EventEmitter<string>();
  @Output() createSchedules = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }

}
