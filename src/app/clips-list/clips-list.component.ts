import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ClipService } from './../services/clip.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-clips-list',
  templateUrl: './clips-list.component.html',
  styleUrls: ['./clips-list.component.css'],
  providers: [DatePipe],
})
export class ClipsListComponent implements OnInit, OnDestroy {
  @Input()
  scrollable = true;

  constructor(public clipService: ClipService) {
    this.clipService.getClips();
  }

  ngOnInit(): void {
    if (this.scrollable) {
      window.addEventListener('scroll', this.handleScroll);
    }
  }

  handleScroll = () => {
    // "offsetHeight" is entire height of the home page
    // "innerHeight" is height visible on the screen
    // "scrollTop" is remaining height, means if our entire home page has 2000px h. and screen size is 600px
    // then when we go to bottom of page then above remaining height is 1400px which is "scrollTop"
    const { scrollTop, offsetHeight } = document.documentElement;
    const { innerHeight } = window;

    const bottomOfWindow = Math.round(scrollTop) + innerHeight === offsetHeight;

    if (bottomOfWindow) {
      console.log('Bottom of the page');
      this.clipService.getClips();
    }
  };

  ngOnDestroy(): void {
    if (this.scrollable) {
      window.removeEventListener('scroll', this.handleScroll);
    }
    this.clipService.pageClips = [];
  }
}
