import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { GifService } from '../../services/gifs.service';
import { GifList } from "../../components/gif-list/gif-list";


@Component({
  selector: 'app-gif-history-page',
  imports: [GifList],
  templateUrl: './gif-history-page.html',
  styles: ``,
})
export default class GifHistoryPage {

  // query = inject(ActivatedRoute).params.subscribe((params) => {
  //   console.log(params['query']);
  // });


  gifService = inject(GifService);

  query = toSignal(inject(ActivatedRoute).params.pipe(
    map(params => params['query'])
  ));

  gifsByKey = computed(() => {
    return this.gifService.gethistoryGifs(this.query());
  })
}
