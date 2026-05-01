import { Component } from '@angular/core';
import { environment } from '@environment/environment';



@Component({
  selector: 'gifs-side-menu-header',
  imports: [],
  templateUrl: './side-menu-header.html',

})
export class SideMenuHeader {

  envs= environment

}
