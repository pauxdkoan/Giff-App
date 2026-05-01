import { Component, inject, signal } from '@angular/core';
import { GifList } from '../../components/gif-list/gif-list';
import { GifService } from '../../services/gifs.service';
import { Gif } from '../../interfaces/gif.interfaces';

@Component({
  selector: 'app-search-page.component',
  imports: [GifList],
  templateUrl: './search-page.component.html',
})
export default class SearchPageComponent {
  gifs = signal<Gif[]>([]);
  gifService = inject(GifService);
  showMessage=  signal(false);

  onSearch(query: string) {
    this.gifService.searchGifs(query).subscribe((response) => {
      this.gifs.set(response);
      this.showMessage.set(response.length === 0);
    });
  }
}
