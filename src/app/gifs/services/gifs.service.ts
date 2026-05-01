import { environment } from '@environment/environment';
import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { __param } from 'tslib';
import { GiphyResponse } from '../interfaces/giphy.interfaces';
import { map, Observable, single, tap } from 'rxjs';
import { Gif } from '../interfaces/gif.interfaces';
import { GifMapper } from '../mapper/gif.mapper';

const loadFromLocalStorage = () => {
  const gifsFromlocalStorage = localStorage.getItem('gifs') ?? '{}';
  const gifs = JSON.parse(gifsFromlocalStorage);

  console.log(gifs);
  return gifs;
};

@Injectable({ providedIn: 'root' })
export class GifService {

  private http = inject(HttpClient);

  trendingGifs = signal<Gif[]>([]);
  trendingGifsLoanding = signal(false);
  private trendingPage = signal(0);

  //Agrupo los gif de 3 en 3 para mostrarlos en filas de 3 columnas...
  trendingGifGroup = computed<Gif[][]>(() => {
    const groups = [];

    for (let i = 0; i < this.trendingGifs().length; i += 3) {
      groups.push(this.trendingGifs().slice(i, i + 3));
    }


    return groups;
  });

  searchHistory = signal<Record<string, Gif[]>>(loadFromLocalStorage());
  searchHistorykey = computed(() => Object.keys(this.searchHistory()));

  saveGifsToLocalStorage = effect(() => {
    const historyString = JSON.stringify(this.searchHistory());
    localStorage.setItem('gifs', historyString);
  });

  constructor() {
    this.loadTrendingGifs();
  }

  loadTrendingGifs() {

    if (this.trendingGifsLoanding()) return;

    this.trendingGifsLoanding.set(true);

    this.http
      .get<GiphyResponse>(`${environment.giphyUrl}/gifs/trending`, {
        params: {
          api_key: environment.giphyApiKey,
          limit: '20',
          offset: this.trendingPage() *20,
        },
      })
      .subscribe((response) => {
        const gifs = GifMapper.mapGiphyItemToGifArray(response.data);
        this.trendingPage.update((current) => current + 1);

        this.trendingGifs.update(currentGifs => [
          ...currentGifs,
          ...gifs,

        ]);
        this.trendingGifsLoanding.set(false);

      });
  }

  searchGifs(query: string): Observable<Gif[]> {
    return this.http
      .get<GiphyResponse>(`${environment.giphyUrl}/gifs/search`, {
        params: {
          api_key: environment.giphyApiKey,
          q: query,
          limit: '20',
        },
      })
      .pipe(
        map(({ data }) => data),
        map((item) => GifMapper.mapGiphyItemToGifArray(item)),

        //Todo: Historial

        tap((items) => {

          if (items.length === 0) return;

          this.searchHistory.update((history) => ({
            ...history,
            [query.toLowerCase()]: items,
          }));
        }),
      );
    // .subscribe((response) => {

    //   const gifs= GifMapper.mapGiphyItemToGifArray(response.data);
    //   console.log({ search: gifs });
    // });
  }

  gethistoryGifs(query: string) {
    return this.searchHistory()[query] ?? [];
  }
}
