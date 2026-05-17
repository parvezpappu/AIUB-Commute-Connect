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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
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

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length < 3) {
      return undefined;
    }

    const timeoutId = window.setTimeout(async () => {
      setLocationError("");
      setIsSearching(true);

      try {
        let data = await searchPlaces(trimmedQuery);

        if (data.length === 0 && !/dhaka|bangladesh/i.test(trimmedQuery)) {
          data = await searchPlaces(`${trimmedQuery}, Dhaka, Bangladesh`);
        }

        setSearchResults(data);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

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

  async function searchPlaces(query) {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=bd&addressdetails=1&accept-language=en&q=${encodeURIComponent(
        query,
      )}`,
    );

    if (!response.ok) {
      throw new Error("Search failed");
    }

    return response.json();
  }

  async function handleSearch() {
    setLocationError("");
    setSearchResults([]);

    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      setLocationError("Type a place name to search.");
      return;
    }

    setIsSearching(true);

    try {
      let data = await searchPlaces(trimmedQuery);

      if (data.length === 0 && !/dhaka|bangladesh/i.test(trimmedQuery)) {
        data = await searchPlaces(`${trimmedQuery}, Dhaka, Bangladesh`);
      }

      setSearchResults(data);

      if (data.length === 0) {
        setLocationError(
          "No location found. Try a known nearby place, road, or area name.",
        );
      }
    } catch {
      setLocationError(
        "Location search failed. Check internet connection or choose on the map.",
      );
    } finally {
      setIsSearching(false);
    }
  }

  function selectSearchResult(result) {
    const latitude = Number(result.lat);
    const longitude = Number(result.lon);

    setSearchQuery(result.display_name || searchQuery);
    setSearchResults([]);

    markerRef.current?.setLatLng([latitude, longitude]);
    mapRef.current?.setView([latitude, longitude], 17);
    setDetectedAddress(result.display_name || "");
    updateLocation(latitude, longitude, result.display_name || "");
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
    <div className="rounded-2xl border border-[#18372f]/15 bg-white">
      <div className="border-b border-[#18372f]/10 p-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => {
              const nextQuery = event.target.value;
              setSearchQuery(nextQuery);

              if (nextQuery.trim().length < 3) {
                setSearchResults([]);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSearch();
              }
            }}
            placeholder="Search exact location, e.g. AIUB Main Gate"
            className="min-w-0 flex-1 rounded-2xl border border-[#18372f]/15 bg-[#f5f7f4] px-4 py-3 text-sm font-semibold text-[#18372f] outline-none placeholder:text-[#7d857f]/70 focus:border-[#18372f]"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="rounded-2xl bg-[#18372f] px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-3 overflow-hidden rounded-2xl border border-[#18372f]/10 bg-white">
            {searchResults.map((result) => (
              <button
                key={result.place_id}
                type="button"
                onClick={() => selectSearchResult(result)}
                className="block w-full border-b border-[#18372f]/10 px-4 py-3 text-left text-sm font-semibold text-[#18372f] last:border-b-0 hover:bg-[#f5f7f4]"
              >
                {result.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        ref={mapContainerRef}
        className="h-72 w-full bg-slate-100"
      />
      <div className="flex flex-col gap-3 border-t border-[#18372f]/10 p-3">
        <div className="text-sm font-semibold text-[#66736d]">
          {value?.latitude && value?.longitude ? (
            <span>
              Selected: {value.latitude}, {value.longitude}
            </span>
          ) : (
            <span>Click the map or use your current location.</span>
          )}
          {isLookingUpAddress && (
            <p className="mt-1 text-sm text-[#66736d]">
              Detecting map address...
            </p>
          )}
          {detectedAddress && (
            <div className="mt-2 rounded-2xl border border-[#18372f]/10 bg-[#f5f7f4] p-3">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7d857f]">
                Detected map address
              </p>
              <p className="mt-1 text-sm font-semibold text-[#18372f]">
                {detectedAddress}
              </p>
              <button
                type="button"
                onClick={() => onUseDetectedAddress?.(detectedAddress)}
                className="mt-2 rounded-2xl border border-[#18372f]/15 bg-white px-3 py-2 text-sm font-black text-[#18372f] hover:border-[#18372f]/35"
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
          className="w-fit rounded-2xl border border-[#18372f]/15 bg-white px-4 py-2 text-sm font-black text-[#18372f] hover:border-[#18372f]/35"
        >
          Use my location
        </button>
      </div>
    </div>
  );
}
