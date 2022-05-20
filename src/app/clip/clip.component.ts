import { ActivatedRoute, Params } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.css']
})
export class ClipComponent implements OnInit {
  id = ''
  constructor(public route: ActivatedRoute) { }

  ngOnInit(): void {
    // this.id = this.route.snapshot.params.id;
    this.route.params.subscribe((params: Params) => {
      this.id = params.id
    })
  }

}
