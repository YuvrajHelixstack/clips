import { Component, Input, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { ModalService } from './../../services/modal.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input()
  modalId = '';

  constructor(public modal: ModalService, public ele: ElementRef) {
    console.log(modal);
  }

  ngOnInit(): void {
    // creating portal/separate element in the body
    document.body.appendChild(this.ele.nativeElement);
  }

  ngOnDestroy() {
    document.body.removeChild(this.ele.nativeElement);
  }
  closeModal() {
    this.modal.toggleModal(this.modalId);
  }
}
