"use client";

import { useEffect, useRef, useState } from "react";

const defaultCenter = {
  latitude: 23.8223,
  longitude: 90.4274,
};

export default function MapPicker({ value, onChange, onUseDetectedAddress }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const leafletRef = useRef(null);
  const [detectedAddress, setDetectedAddress] = useState("");
  const [isLookingUpAddress, setIsLookingUpAddress] = useState(false);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function setupMap() {
      const L = await import("leaflet");

      if (!isMounted || !mapContainerRef.current || mapRef.current) {
        return;
      }

      leafletRef.current = L;

      const startingPoint = value?.latitude ? value : defaultCenter;
      const map = L.map(mapContainerRef.current, {
        center: [startingPoint.latitude, startingPoint.longitude],
        zoom: 15,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      const marker = L.marker(
        [startingPoint.latitude, startingPoint.longitude],
        {
          draggable: true,
          icon: L.divIcon({
            className: "acc-map-marker",
            html: '<span aria-hidden="true"></span>',
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          }),
        },
      ).addTo(map);

      marker.on("dragend", () => {
        const position = marker.getLatLng();
        selectLocation(position.lat, position.lng);
      });

      map.on("click", (event) => {
        marker.setLatLng(event.latlng);
        selectLocation(event.latlng.lat, event.latlng.lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
    }

    setupMap();

    return () => {
      isMounted = false;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // Map should initialize once; later value changes are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!value?.latitude || !value?.longitude || !mapRef.current) {
      return;
    }

    const nextPosition = [value.latitude, value.longitude];
    markerRef.current?.setLatLng(nextPosition);
    mapRef.current.setView(nextPosition, mapRef.current.getZoom());
  }, [value]);

  function updateLocation(latitude, longitude, locationName = "") {
    onChange({
      latitude: Number(latitude.toFixed(6)),
      longitude: Number(longitude.toFixed(6)),
      locationName,
    });
  }

  async function selectLocation(latitude, longitude) {
    setLocationError("");
    setIsLookingUpAddress(true);

    try {
      const locationName = await getLocationName(latitude, longitude);
      setDetectedAddress(locationName);
      updateLocation(latitude, longitude, locationName);
    } catch {
      setDetectedAddress("");
      updateLocation(latitude, longitude);
      setLocationError(
        "Location selected, but the address could not be detected automatically.",
      );
    } finally {
      setIsLookingUpAddress(false);
    }
  }

  async function getLocationName(latitude, longitude) {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
    );

    if (!response.ok) {
      throw new Error("Location lookup failed");
    }

    const data = await response.json();
    return data.display_name || "";
  }

  function handleUseCurrentLocation() {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Location access is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        selectLocation(latitude, longitude);
      },
      () => {
        setLocationError("Allow location access or choose the point on the map.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  }

  return (
    <div className="rounded-md border border-slate-300 bg-white">
      <div
        ref={mapContainerRef}
        className="h-72 w-full rounded-t-md bg-slate-100"
      />
      <div className="flex flex-col gap-3 border-t border-slate-200 p-3">
        <div className="text-sm text-slate-600">
          {value?.latitude && value?.longitude ? (
            <span>
              Selected: {value.latitude}, {value.longitude}
            </span>
          ) : (
            <span>Click the map or use your current location.</span>
          )}
          {isLookingUpAddress && (
            <p className="mt-1 text-sm text-slate-500">
              Detecting map address...
            </p>
          )}
          {detectedAddress && (
            <div className="mt-2 rounded-md bg-slate-50 p-3">
              <p className="text-xs font-medium uppercase text-slate-500">
                Detected map address
              </p>
              <p className="mt-1 text-sm text-slate-700">{detectedAddress}</p>
              <button
                type="button"
                onClick={() => onUseDetectedAddress?.(detectedAddress)}
                className="mt-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
              >
                Use detected address as name
              </button>
            </div>
          )}
          {locationError && (
            <p className="mt-1 text-sm text-red-600">{locationError}</p>
          )}
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="w-fit rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Use my location
        </button>
      </div>
    </div>
  );
}
