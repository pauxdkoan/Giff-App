import { ScrollStateService } from './../../../shared/services/scroll-sate.service';
import { GifService } from './../../services/gifs.service';
import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { GifList } from "../../components/gif-list/gif-list";



@Component({
  selector: 'app-treding-page.component',
  templateUrl: './treding-page.component.html',
})


export default class TredingPageComponent {

  gifService = inject(GifService);
  scrollDivRef = viewChild<ElementRef<HTMLDivElement>>('groupDiv');
  ScrollStateService = inject(ScrollStateService);

  onScroll(envent: Event) {
    const scrollDiv = this.scrollDivRef()?.nativeElement;

    if (!scrollDiv) return;

    const scrollTop = scrollDiv.scrollTop;
    const clientHeight = scrollDiv.clientHeight;
    const scrollHeight = scrollDiv.scrollHeight;

    // console.log({ scrollTop, clientHeight, scrollHeight });
    const isAtBottom = scrollTop + clientHeight + 300 >= scrollHeight; ;
    this.ScrollStateService.trendingScrollState.set(scrollTop);
    
    if (isAtBottom) {

      //TODO: Cargar la siguiente pagina
      this.gifService.loadTrendingGifs();
    }





  }

}






