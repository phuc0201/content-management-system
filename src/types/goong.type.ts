export interface GoongGeocodeResult {
  formatted_address: string;
  place_id: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export interface GoongGeocodeResponse {
  status: string;
  results: GoongGeocodeResult[];
}
