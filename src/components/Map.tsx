"use client";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon, LatLngTuple } from "leaflet";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

interface prop {
  latlng: [LatLngTuple, Dispatch<SetStateAction<LatLngTuple>>];
}

interface TypeE {
  lat: number;
  lng: number;
}

function DraggableMarker({ latlng }: prop) {
  const [draggable, setDraggable] = useState(false);
  const [position, setPosition] = latlng;
  const markerRef = useRef<any>(null);
  const customLocIcon = new Icon({
    iconUrl:
      "https://www.iconpacks.net/icons/2/free-location-pin-icon-2965-thumb.png",
    iconSize: [32, 32],
  });

  const map = useMapEvents({
    click() {
      map.locate();
    },
    locationfound(e) {
      let location: TypeE = e.latlng;
      setPosition([location.lat, location.lng]);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition([newPos.lat, newPos.lng]);
          map.flyTo(newPos, map.getZoom()); // Ensures the map moves to marker position
        }
      },
    }),
    [],
  );

  const toggleDraggable = useCallback(() => {
    setDraggable((d: any) => !d);
  }, []);

  return (
    <Marker
      icon={customLocIcon}
      draggable={draggable}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    >
      <Popup minWidth={90}>
        <span onClick={toggleDraggable}>
          {draggable
            ? "Marker is draggable"
            : "Click here to make marker draggable"}
        </span>
      </Popup>
    </Marker>
  );
}

export default function Map({ latlng }: prop) {
  return (
    <MapContainer
      center={latlng[0]}
      zoom={13}
      scrollWheelZoom={true}
      className="h-full"
    >
      {/* Labels layer with full opacity */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Satellite layer with lower opacity for transparency */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        opacity={0.5}
      />

      <DraggableMarker latlng={latlng} />
    </MapContainer>
  );
}
