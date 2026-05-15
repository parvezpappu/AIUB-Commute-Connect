"use client";

import { useCallback, useEffect, useRef } from "react";

export default function LiveCommuteMap({
  meetingLatitude,
  meetingLongitude,
  meetingLabel,
  creatorLocation,
  participants,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerLayerRef = useRef(null);
  const latestMapDataRef = useRef({
    meetingLatitude,
    meetingLongitude,
    meetingLabel,
    creatorLocation,
    participants,
  });

  useEffect(() => {
    latestMapDataRef.current = {
      meetingLatitude,
      meetingLongitude,
      meetingLabel,
      creatorLocation,
      participants,
    };
  }, [
    creatorLocation,
    meetingLabel,
    meetingLatitude,
    meetingLongitude,
    participants,
  ]);

  const renderMarkers = useCallback(
    (L) => {
      if (!markerLayerRef.current || !mapRef.current) {
        return;
      }

      const mapData = latestMapDataRef.current;
      markerLayerRef.current.clearLayers();

      const bounds = [];
      const meetingPosition = [
        mapData.meetingLatitude,
        mapData.meetingLongitude,
      ];
      bounds.push(meetingPosition);

      L.marker(meetingPosition, {
        icon: L.divIcon({
          className: "acc-map-marker acc-map-marker-meeting",
          html: '<span aria-hidden="true"></span>',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        }),
      })
        .addTo(markerLayerRef.current)
        .bindPopup(mapData.meetingLabel || "Meeting point")
        .bindTooltip(mapData.meetingLabel || "Meeting point", {
          permanent: true,
          direction: "top",
          offset: [0, -16],
          className: "acc-map-tooltip",
        });

      if (mapData.creatorLocation?.latitude && mapData.creatorLocation?.longitude) {
        const creatorPosition = [
          mapData.creatorLocation.latitude,
          mapData.creatorLocation.longitude,
        ];
        bounds.push(creatorPosition);

        L.marker(creatorPosition, {
          icon: L.divIcon({
            className: "acc-map-marker acc-map-marker-creator",
            html: '<span aria-hidden="true"></span>',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          }),
        })
          .addTo(markerLayerRef.current)
          .bindPopup(mapData.creatorLocation.name || "Creator")
          .bindTooltip(mapData.creatorLocation.name || "Creator", {
            permanent: true,
            direction: "top",
            offset: [0, -14],
            className: "acc-map-tooltip",
          });
      }

      mapData.participants
        .filter(
          (participant) =>
            participant.currentLatitude && participant.currentLongitude,
        )
        .forEach((participant) => {
          const position = [
            participant.currentLatitude,
            participant.currentLongitude,
          ];
          bounds.push(position);

        L.marker(position, {
          icon: L.divIcon({
            className: "acc-map-marker acc-map-marker-member",
            html: '<span aria-hidden="true"></span>',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          }),
        })
          .addTo(markerLayerRef.current)
          .bindPopup(participant.user?.fullName || "Member")
          .bindTooltip(participant.user?.fullName || "Member", {
            permanent: true,
            direction: "top",
            offset: [0, -14],
            className: "acc-map-tooltip",
          });
      });

      if (bounds.length > 1) {
        mapRef.current.fitBounds(bounds, {
          padding: [32, 32],
          maxZoom: 16,
        });
      }
    },
    [],
  );

  useEffect(() => {
    let isMounted = true;

    async function setupMap() {
      if (
        !meetingLatitude ||
        !meetingLongitude ||
        !mapContainerRef.current ||
        mapRef.current
      ) {
        return;
      }

      const L = await import("leaflet");

      if (!isMounted || !mapContainerRef.current) {
        return;
      }

      const meetingPosition = [meetingLatitude, meetingLongitude];
      const map = L.map(mapContainerRef.current, {
        center: meetingPosition,
        zoom: 15,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      markerLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      renderMarkers(L);
    }

    setupMap();

    return () => {
      isMounted = false;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerLayerRef.current = null;
      }
    };
  }, [meetingLatitude, meetingLongitude, renderMarkers]);

  useEffect(() => {
    async function refreshMarkers() {
      if (!mapRef.current || !markerLayerRef.current) {
        return;
      }

      const L = await import("leaflet");
      renderMarkers(L);
    }

    refreshMarkers();
  }, [
    creatorLocation,
    meetingLabel,
    meetingLatitude,
    meetingLongitude,
    participants,
    renderMarkers,
  ]);

  if (!meetingLatitude || !meetingLongitude) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-200">
      <div ref={mapContainerRef} className="h-80 w-full bg-slate-100" />
    </div>
  );
}
