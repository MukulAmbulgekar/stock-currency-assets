export interface Asset {
    id: number;
    assetName: string; // "USD", Samsung Electronics Co Ltd : "SSNLF"
    price: number; // asset current price relative to USD
    lastUpdate: number; // unix timestamp
    type: 'Currency' | 'Stock'; // asset type Currency (e.g. USD, EUR...) or Stock (Samsung, Google)
}
export interface Column {
    name: string;
    value: string;
}
