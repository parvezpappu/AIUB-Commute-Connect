"use client";

import { useEffect, useRef } from "react";

export default function MapPreview({ latitude, longitude, label }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function setupMap() {
      if (!latitude || !longitude || !mapContainerRef.current || mapRef.current) {
        return;
      }

      const L = await import("leaflet");

      if (!isMounted || !mapContainerRef.current) {
        return;
      }

      const position = [latitude, longitude];
      const map = L.map(mapContainerRef.current, {
        center: position,
        zoom: 16,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      L.marker(position, {
        icon: L.divIcon({
          className: "acc-map-marker",
          html: '<span aria-hidden="true"></span>',
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        }),
      })
        .addTo(map)
        .bindPopup(label || "Meeting point");

      mapRef.current = map;
    }

    setupMap();

    return () => {
      isMounted = false;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [label, latitude, longitude]);

  if (!latitude || !longitude) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-200">
      <div ref={mapContainerRef} className="h-72 w-full bg-[#dbe6ea]" />
    </div>
  );
}
