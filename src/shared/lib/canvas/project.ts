export const WORLD_WEST = -180;
export const WORLD_EAST = 180;
export const WORLD_SOUTH = -55;
export const WORLD_NORTH = 80;

export interface CanvasPoint {
  x: number;
  y: number;
}

export function projectLonLat(longitude: number, latitude: number, width: number, height: number): CanvasPoint {
  return {
    x: ((longitude - WORLD_WEST) / (WORLD_EAST - WORLD_WEST)) * width,
    y: ((WORLD_NORTH - latitude) / (WORLD_NORTH - WORLD_SOUTH)) * height,
  };
}
