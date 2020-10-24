import { Component, OnInit } from '@angular/core';
import { DataService } from './../services/data.service';
import { Asset, Column } from './../model/asset';
import { interval } from 'rxjs';
import { GridApi } from 'ag-grid-community';
import { FavoriteComponent } from './favorite/favorite.component';
@Component({
  selector: 'app-stocks-table',
  templateUrl: './stocks-table.component.html',
  styles: [`
        .btn-success-custom {
          color: #fff !important;
          background-color: #639b70 !important;
          border-color: #28a745 !important;
      }
    `]
})
export class StocksTableComponent implements OnInit {
  private gridApi: GridApi;
  assets: Asset[];
  defaultColDef = {
    flex: 1,
    minWidth: 150,
    resizable: true,
    filterParams: { apply: true, newRowsAction: 'keep' }
  };
  columnDefs;
  frameworkComponents;
  addToFavoriteAlerts = [];
  removeFromFavoriteAlerts = [];
  columns: Column[] = [{
    name: 'ID',
    value: 'id'
  }, {
    name: 'Asset Name',
    value: 'assetName'
  }, {
    name: 'Price',
    value: 'price'
  }, {
    name: 'Last Update',
    value: 'lastUpdate'
  }, {
    name: 'Type',
    value: 'type'
  }];

  constructor(private dataService: DataService) {
    this.columnDefs = this.columns.map(col => {
      return {
        field: col.value,
        sortable: true,
        valueFormatter: col.value === 'lastUpdate' ? this.dateFormatter : null,
        filter: ['id', 'price'].includes(col.value) ? 'agNumberColumnFilter' : col.value === 'lastUpdate' ? 'agDateColumnFilter' : true
      };
    });


    this.columnDefs.push({
      field: 'Favorite',
      cellRenderer: 'favoriteCellRenderer',
      cellRendererParams: {
        clicked: (assetId: number, isFavorite: boolean) => {
          this.onShowAlert(assetId, isFavorite);
        }
      }
    });

    this.frameworkComponents = {
      favoriteCellRenderer: FavoriteComponent
    };
  }

  ngOnInit(): void {
    this.dataService.randomPrices().subscribe(response => {
      this.assets = response;
      this.moveFavoritesToTop();
    }, error => {
      console.log(`error in getting assets ${error}`);
    });
  }

  onGridReady(params): void {
    this.gridApi = params.api;
    interval(1000).subscribe(x => {
      this.dataService.randomPrices(this.assets).subscribe((response: Asset[]) => {
        this.gridApi.setRowData(response);
      }, error => {
        console.log(`error in getting assets ${error}`);
      });
    });
  }


  onClearFilters(): void {
    this.gridApi.setFilterModel(null);
  }

  onRemoveSort(): void {
    this.gridApi.setSortModel(null);
  }

  onPageSizeChanged(): void {
    const value = (document.getElementById('page-size') as HTMLInputElement).value;
    this.gridApi.paginationSetPageSize(Number(value));
  }

  onClearFavorites(): void {
    localStorage.clear();
    this.moveFavoritesToTop();
  }

  onCloseAlert(alertId): void {
    const id = document.getElementById(alertId);
    if (id) { id.classList.add('d-none'); }
  }

  onShowAlert(assetId: number, isFavorite: boolean): void {
    // add to favorite 
    if (isFavorite) {
      // find index of favorite asset, remove and push to front
      let index = this.assets.map(asset => asset.id).indexOf(assetId);
      let temp = this.assets[index];
      this.assets.splice(index, 1)
      this.assets.unshift(temp);
      this.gridApi.setRowData(this.assets);
      this.addToFavoriteAlerts.push(assetId);
      const id = document.getElementById('alert-' + assetId);
      if (id) { id.classList.remove('d-none'); }

      // auto-close alert after 3 sec
      setTimeout(() => {
        this.addToFavoriteAlerts.shift();
      }, 3000);
    } else { // remove from favorite 
      this.moveFavoritesToTop();
      this.removeFromFavoriteAlerts.push(assetId);
      const id = document.getElementById('closed-alert-' + assetId);
      if (id) { id.classList.remove('d-none'); }

      // auto-close alert after 3 sec
      setTimeout(() => {
        this.removeFromFavoriteAlerts.shift();
      }, 3000);
    }
  }

  // private functions
  private dateFormatter(params): string {
    return params.value ? (new Date(params.value)).toLocaleDateString() + ' ' + (new Date(params.value)).toLocaleTimeString() : '';
  }

  private moveFavoritesToTop(): void {
    // find favorites from local storage
    const favoritesFromLocalStorage = new Set(Object.keys(localStorage));
    // filter favorites from assets
    const favorites = this.assets.filter(aseet => favoritesFromLocalStorage.has(aseet.id.toString())).sort((a, b) => b.id - a.id);
    this.assets = this.assets.filter(aseet => !favoritesFromLocalStorage.has(aseet.id.toString()));
    favorites.forEach(f => this.assets.unshift(f)); // push favorites to top
  }
}
