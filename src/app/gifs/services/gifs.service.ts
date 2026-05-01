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
  trendingGifLoanding = signal(true);

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
    this.http
      .get<GiphyResponse>(`${environment.giphyUrl}/gifs/trending`, {
        params: {
          api_key: environment.giphyApiKey,
          limit: '25',
        },
      })
      .subscribe((response) => {
        const gifs = GifMapper.mapGiphyItemToGifArray(response.data);
        this.trendingGifs.set(gifs);
        this.trendingGifLoanding.set(false);
        console.log(gifs);
      });
  }

  searchGifs(query: string): Observable<Gif[]> {
    return this.http
      .get<GiphyResponse>(`${environment.giphyUrl}/gifs/search`, {
        params: {
          api_key: environment.giphyApiKey,
          q: query,
          limit: '25',
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
