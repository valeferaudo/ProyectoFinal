import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-payment-required-info',
  templateUrl: './payment-required-info.component.html',
  styleUrls: ['./payment-required-info.component.css']
})
export class PaymentRequiredInfoComponent implements OnInit {

  @Input() hiddenModal: boolean;
  @Output() closeModal = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }
  closedModal(){
    this.closeModal.emit()
  }
}
