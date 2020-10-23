import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { DataService } from 'src/app/services/data.service';
@Component({
  selector: 'app-favorite',
  template: `
  <button class="btn btn-link" style="cursor: pointer;"
    (click)="!dataService.checkIfExistInFavorite(assetId) ? dataService.saveAsFavorite(assetId) : dataService.removeAsFavorite(assetId); onFavoriteClick()">
    <i class="fa fa-2x text-danger"
    [ngClass]="{'fa-heart-o': !dataService.checkIfExistInFavorite(assetId), 'fa-heart': dataService.checkIfExistInFavorite(assetId) }"
    aria-hidden="true">
    </i>
  </button>`,
  styles: []
})

export class FavoriteComponent implements ICellRendererAngularComp {
  private params: any;
  assetId: number;
  isFavorite: boolean;
  constructor(public dataService: DataService) {
  }

  agInit(params: any): void {
    this.params = params;
    this.assetId = this.params.data.id;
    this.isFavorite = this.dataService.checkIfExistInFavorite(this.assetId) ? true : false;
  }

  onFavoriteClick(): void {
    this.params.clicked(this.assetId, !this.isFavorite);
  }

  refresh(): boolean {
    return false;
  }
}
