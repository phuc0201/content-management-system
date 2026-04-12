import type { LeafletEventHandlerFnMap } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { toast } from "react-toastify";
import markerImg from "../../assets/images/location/pin.png";

const markerIcon = L.icon({
  iconUrl: markerImg,
  iconRetinaUrl: markerImg,
  iconSize: [44, 44],
  iconAnchor: [22, 44],
  popupAnchor: [0, -40],
});

type MapProps = {
  center?: [number, number];
  markerPosition?: [number, number];
  zoom?: number;
  onPositionChange?: (position: [number, number]) => void;
  onInteractionModeChange?: (mode: "desktop" | "touch") => void;
};

const defaultPosition: [number, number] = [10.850664000361634, 106.77191309664425];
const EPSILON = 0.000001;

const isSamePosition = (a: [number, number], b: [number, number]) =>
  Math.abs(a[0] - b[0]) < EPSILON && Math.abs(a[1] - b[1]) < EPSILON;

const detectInteractionMode = (): "desktop" | "touch" => {
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const mobileOrTabletWidth = window.matchMedia("(max-width: 1024px)").matches;
  return coarsePointer || mobileOrTabletWidth ? "touch" : "desktop";
};

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);

  return null;
}

function MapInteractionHandler({
  interactionMode,
  onPositionChange,
  onUserInteraction,
}: {
  interactionMode: "desktop" | "touch";
  onPositionChange?: (position: [number, number]) => void;
  onUserInteraction?: () => void;
}) {
  const lastEmittedPositionRef = useRef<[number, number] | null>(null);

  const emitPosition = (position: [number, number]) => {
    const lastPosition = lastEmittedPositionRef.current;
    if (lastPosition && isSamePosition(lastPosition, position)) return;
    lastEmittedPositionRef.current = position;
    onPositionChange?.(position);
  };

  useMapEvents({
    click: (event) => {
      if (interactionMode !== "desktop") return;
      onUserInteraction?.();
      emitPosition([event.latlng.lat, event.latlng.lng]);
    },
    moveend: (event) => {
      if (interactionMode !== "touch") return;
      const center = event.target.getCenter();
      onUserInteraction?.();
      emitPosition([center.lat, center.lng]);
    },
  });

  return null;
}

export default function Map({
  center = defaultPosition,
  markerPosition,
  zoom = 17,
  onPositionChange,
  onInteractionModeChange,
}: MapProps) {
  const [interactionMode, setInteractionMode] = useState<"desktop" | "touch">("desktop");
  const [isLocating, setIsLocating] = useState(false);
  const hasUserInteractedRef = useRef(false);
  const activeMarkerPosition = markerPosition ?? center;

  const markUserInteracted = useCallback(() => {
    hasUserInteractedRef.current = true;
  }, []);

  const requestGeolocation = useCallback(
    (shouldRespectInteraction: boolean) => {
      if (!("geolocation" in navigator) || isLocating) {
        toast.error("Trình duyệt của bạn không hỗ trợ định vị hoặc đang trong quá trình định vị.");
        return;
      }

      setIsLocating(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (shouldRespectInteraction && hasUserInteractedRef.current) {
            setIsLocating(false);
            return;
          }

          const nextPosition: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          onPositionChange?.(nextPosition);
          setIsLocating(false);
          toast.success("Đã lấy được vị trí hiện tại.");
        },
        () => {
          setIsLocating(false);
          toast.error("Vui lòng cho phép truy cập vị trí hoặc thử lại sau.");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      );
    },
    [isLocating, onPositionChange],
  );

  useEffect(() => {
    const pointerMedia = window.matchMedia("(pointer: coarse)");
    const widthMedia = window.matchMedia("(max-width: 1024px)");

    const updateMode = () => {
      const mode = detectInteractionMode();
      setInteractionMode(mode);
      onInteractionModeChange?.(mode);
    };

    updateMode();
    pointerMedia.addEventListener("change", updateMode);
    widthMedia.addEventListener("change", updateMode);
    window.addEventListener("resize", updateMode);

    return () => {
      pointerMedia.removeEventListener("change", updateMode);
      widthMedia.removeEventListener("change", updateMode);
      window.removeEventListener("resize", updateMode);
    };
  }, [onInteractionModeChange]);

  const markerEventHandlers = useMemo<LeafletEventHandlerFnMap>(
    () => ({
      click: () => undefined,
    }),
    [],
  );

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "320px",
      }}
      className="h-full"
    >
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={true}
        scrollWheelZoom={true}
        touchZoom={true}
        doubleClickZoom={true}
        boxZoom={true}
        keyboard={true}
        style={{ height: "100%", width: "100%" }}
      >
        <RecenterMap center={center} />
        <MapInteractionHandler
          interactionMode={interactionMode}
          onPositionChange={onPositionChange}
          onUserInteraction={markUserInteracted}
        />

        <TileLayer
          url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&scale=2"
          subdomains={["mt0", "mt1", "mt2", "mt3"]}
          maxZoom={20}
          attribution="Google"
          detectRetina={true}
        />

        {interactionMode === "desktop" && (
          <Marker
            position={activeMarkerPosition}
            icon={markerIcon}
            eventHandlers={markerEventHandlers}
          >
            <Popup>
              Location: {activeMarkerPosition[0].toFixed(6)}, {activeMarkerPosition[1].toFixed(6)}
            </Popup>
          </Marker>
        )}
        {interactionMode === "touch" && (
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-20000 -translate-x-1/2 -translate-y-full">
            <img
              src={markerImg}
              alt="Center pin"
              className="h-11 w-11 object-contain drop-shadow-lg"
            />
          </div>
        )}
      </MapContainer>

      <button
        type="button"
        onClick={() => requestGeolocation(false)}
        disabled={isLocating}
        className="absolute right-3 top-3 z-1000 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-md transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
        title="Lấy vị trí hiện tại"
        aria-label="Lấy vị trí hiện tại"
      >
        {isLocating ? (
          <svg
            className="h-5 w-5 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.3" />
            <path
              d="M21 12a9 9 0 0 0-9-9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2V5M12 19V22M2 12H5M19 12H22M12 8.5A3.5 3.5 0 1 1 8.5 12A3.5 3.5 0 0 1 12 8.5Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.8" opacity="0.5" />
          </svg>
        )}
      </button>

      {interactionMode === "touch" && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-full">
          <img
            src={markerImg}
            alt="Center pin"
            className="h-11 w-11 object-contain drop-shadow-lg"
          />
        </div>
      )}
    </div>
  );
}
