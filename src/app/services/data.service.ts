import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Asset } from '../model/asset';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private assets: Asset[];
  constructor() {
    this.assets = this.getAllAssets(200);
  }

  private createAsset = (assetId, assetType): Asset => {
    return {
      id: assetId,
      assetName: assetType === 'Stock' ? ['AAPL', 'GOOGL', 'FB', 'TSLA', 'MSFT'][Math.floor(Math.random() * 4)] : ['EUR', 'USD', 'GBP', 'NIS', 'AUD'][Math.floor(Math.random() * 4)],
      price: (Math.random() * 10),
      lastUpdate: Date.now(),
      type: assetType
    };
  }

  private getAllAssets = (n: number) => {
    const result: Asset[] = [];
    for (let i = 1; i <= n * 2; i = i + 2) {
      result.push(this.createAsset(i, 'Stock'));
      result.push(this.createAsset(i + 1, 'Currency'));
    }
    return result;
  }



  randomPrices(): Observable<Asset[]> {
    return of(this.assets.map(val => {
      const random = Math.random();
      val.price = random >= 0.5 ? val.price + random : val.price - random;
      val.lastUpdate = Date.now();
      return val;
    }));
  }

  // this function controls UI, if already in local storage, show option to remove as favorite
  checkIfExistInFavorite(assetId: number): string {
    return localStorage.getItem(assetId.toString());
  }

  // save to local storage and move favorites to top
  saveAsFavorite(assetId: number): void {
    const strAssetId = assetId.toString();
    localStorage.setItem(strAssetId, strAssetId);
  }

  // remove from local storage
  removeAsFavorite(assetId: number): void {
    localStorage.removeItem(assetId.toString());
  }
}
