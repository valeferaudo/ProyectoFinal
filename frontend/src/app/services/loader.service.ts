import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  showFullScreenLoader: boolean = false;
  showLineLoader: boolean = false;
  constructor() {}

  openFullScreenLoader() {
    this.showFullScreenLoader = true;
  }

  closeFullScreenLoader() {
    this.showFullScreenLoader = false;
  }
  openLineLoader() {
    this.showLineLoader = true;
  }

  closeLineLoader() {
    this.showLineLoader = false;
  }
}
