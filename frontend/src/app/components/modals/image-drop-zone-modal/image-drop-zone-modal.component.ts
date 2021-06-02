import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-image-drop-zone-modal',
  templateUrl: './image-drop-zone-modal.component.html',
  styleUrls: ['./image-drop-zone-modal.component.css']
})
export class ImageDropZoneModalComponent implements OnInit {

  files: File[] = [];
  @Output() setImages = new EventEmitter<File[]>();
  constructor() { }

  ngOnInit(): void {
  }
  onSelect(event) {
    console.log(event);
    this.files.push(...event.addedFiles);
    this.setImages.emit(this.files)
  }
  
  onRemove(event) {
    // console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
    this.setImages.emit(this.files)
  }
}
