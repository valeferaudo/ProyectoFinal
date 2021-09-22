import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-cancel-policy',
  templateUrl: './cancel-policy.component.html',
  styleUrls: ['./cancel-policy.component.css']
})
export class CancelPolicyComponent implements OnInit {

  @Input() hiddenModal: boolean;
  @Input() sportCenter: any;
  @Output() closeModal = new EventEmitter<string>();
  constructor() { }

  ngOnInit(): void {
  }
  closedModal(){
    this.closeModal.emit()
  }
}
