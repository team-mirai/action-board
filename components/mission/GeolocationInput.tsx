"use client";

import { useState } from "react";

type GeolocationData = {
  lat: number;
  lon: number;
  accuracy?: number;
  altitude?: number;
};

type GeolocationInputProps = {
  disabled: boolean;
  onGeolocationChange: (geolocation: GeolocationData | null) => void;
};

export function GeolocationInput({
  disabled,
  onGeolocationChange,
}: GeolocationInputProps) {
  const [isFetchingGeo, setIsFetchingGeo] = useState(false);
  const [geolocationError, setGeolocationError] = useState<string | null>(null);
  const [geolocation, setGeolocation] = useState<GeolocationData | null>(null);

  const handleGetGeolocation = () => {
    if (!navigator.geolocation) {
      setGeolocationError("お使いのブラウザは位置情報取得に対応していません。");
      return;
    }
    setIsFetchingGeo(true);
    setGeolocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newGeolocation = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude ?? undefined,
        };
        setGeolocation(newGeolocation);
        onGeolocationChange(newGeolocation);
        setIsFetchingGeo(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setGeolocationError(`位置情報の取得に失敗しました: ${error.message}`);
        setGeolocation(null);
        onGeolocationChange(null);
        setIsFetchingGeo(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleGetGeolocation}
        disabled={disabled || isFetchingGeo}
        className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded disabled:opacity-50"
      >
        {isFetchingGeo ? "位置情報取得中..." : "位置情報を取得する"}
      </button>
      {geolocationError && (
        <p className="mt-1 text-xs text-red-500">{geolocationError}</p>
      )}
      {geolocation && (
        <p className="mt-1 text-xs text-green-500">
          位置情報取得完了: Lat: {geolocation.lat.toFixed(4)}, Lon:{" "}
          {geolocation.lon.toFixed(4)}
        </p>
      )}
    </div>
  );
}
