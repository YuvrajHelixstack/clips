import {
  AfterContentInit,
  Component,
  ContentChildren,
  OnInit,
  QueryList,
} from '@angular/core';
import { TabComponent } from './../tab/tab.component';

@Component({
  selector: 'app-tabs-container',
  templateUrl: './tabs-container.component.html',
  styleUrls: ['./tabs-container.component.css'],
})
export class TabsContainerComponent implements OnInit, AfterContentInit {
  
  @ContentChildren(TabComponent)
  tabs?: QueryList<TabComponent>;

  constructor() {}

  ngOnInit(): void {}

  ngAfterContentInit(): void {
    const activeTabs = this.tabs?.filter((tab) => tab.active);

    if (!activeTabs || activeTabs.length === 0) {
      this.selectTab(this.tabs!.first);
    }
  }

  selectTab(tab: TabComponent) {
    this.tabs?.forEach((tab) => (tab.active = false));

    tab.active = true;

    // we use this function in link tag, so to preventDefault() we could also return false;
    return false;
  }
}
