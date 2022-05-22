import { ActivatedRoute, Params } from '@angular/router';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
} from '@angular/core';
import videojs from 'video.js';
import IClip from 'src/app/models/clip.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.css'],
  providers: [DatePipe],
  encapsulation: ViewEncapsulation.None,
})
export class ClipComponent implements OnInit {
  // id = '';

  // we are accessing html element which has #videoPlayer variable
  // this element is static that' why we can add additional property to @ViewChild(),
  // otherwise we have to initialize it in ngAfterInit() function
  @ViewChild('videoPlayer', { static: true })
  target?: ElementRef;
  player?: videojs.Player;

  clip?: IClip;

  constructor(public route: ActivatedRoute) {}

  ngOnInit(): void {
    this.player = videojs(this.target?.nativeElement);
    // this.id = this.route.snapshot.params.id;
    // this.route.params.subscribe((params: Params) => {
    //   this.id = params.id;
    // });

    this.route.data.subscribe((data) => {
      this.clip = data.clip as IClip;

      this.player?.src({
        src: this.clip.clipURL,
        type: 'video/mp4',
      });
    });
  }
}
