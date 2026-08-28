import { useEffect } from 'react';
import L, { type Marker as LeafletMarker } from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

export type MapCoordinates = [latitude: number, longitude: number];

interface PropertyMapProps {
  center: MapCoordinates;
  position: MapCoordinates | null;
  editable?: boolean;
  onPositionChange?: (position: MapCoordinates) => void;
}

const propertyMarkerIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

function MapCenterUpdater({ center }: { center: MapCoordinates }) {
  const map = useMap();
  const [latitude, longitude] = center;

  useEffect(() => {
    map.setView([latitude, longitude], map.getZoom());
  }, [latitude, longitude, map]);

  return null;
}

function MapClickHandler({ onPositionChange }: { onPositionChange: (position: MapCoordinates) => void }) {
  useMapEvents({
    click(event) {
      onPositionChange([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

export function PropertyMap({ center, position, editable = false, onPositionChange }: PropertyMapProps) {
  const updatePosition = editable && onPositionChange ? onPositionChange : undefined;

  return (
    <MapContainer
      center={center}
      zoom={position ? 15 : 13}
      className="property-map"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapCenterUpdater center={center} />
      {updatePosition && <MapClickHandler onPositionChange={updatePosition} />}
      {position && (
        <Marker
          position={position}
          icon={propertyMarkerIcon}
          draggable={Boolean(updatePosition)}
          eventHandlers={updatePosition ? {
            dragend(event) {
              const marker = event.target as LeafletMarker;
              const coordinates = marker.getLatLng();
              updatePosition([coordinates.lat, coordinates.lng]);
            },
          } : undefined}
        />
      )}
    </MapContainer>
  );
}
