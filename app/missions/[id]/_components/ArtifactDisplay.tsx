"use client";

import Link from "next/link";
import type React from "react";
import type { MissionArtifact } from "./types";

interface ArtifactDisplayProps {
  artifact: MissionArtifact;
}

const ImageArtifact: React.FC<{ artifact: MissionArtifact }> = ({
  artifact,
}) => (
  <div className="mb-2">
    <div className="w-32 h-32 relative mb-2">
      {artifact.image_storage_path && (
        <img
          src={artifact.image_storage_path}
          alt="提出画像"
          className="w-32 h-32 object-cover rounded"
        />
      )}
    </div>
    <p className="text-xs text-gray-400">位置情報: なし</p>
    {artifact.description && (
      <p className="text-sm mt-1">{artifact.description}</p>
    )}
  </div>
);

const ImageWithGeolocationArtifact: React.FC<{ artifact: MissionArtifact }> = ({
  artifact,
}) => (
  <div className="mb-2">
    <div className="w-32 h-32 relative mb-2">
      {artifact.image_storage_path && (
        <img
          src={artifact.image_storage_path}
          alt="提出画像"
          className="w-32 h-32 object-cover rounded"
        />
      )}
    </div>
    <p className="text-xs text-gray-400">
      位置情報:{" "}
      {artifact.geolocations && artifact.geolocations.length > 0
        ? "あり"
        : "なし"}
    </p>
    {artifact.description && (
      <p className="text-sm mt-1">{artifact.description}</p>
    )}
  </div>
);

const LinkArtifact: React.FC<{ artifact: MissionArtifact }> = ({
  artifact,
}) => (
  <div className="mb-2">
    {artifact.link_url && (
      <Link
        href={artifact.link_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline"
      >
        {artifact.link_url}
      </Link>
    )}
    {artifact.description && (
      <p className="text-sm mt-1">{artifact.description}</p>
    )}
  </div>
);

const ArtifactDisplay: React.FC<ArtifactDisplayProps> = ({ artifact }) => {
  switch (artifact.artifact_type) {
    case "IMAGE":
      return <ImageArtifact artifact={artifact} />;
    case "IMAGE_WITH_GEOLOCATION":
      return <ImageWithGeolocationArtifact artifact={artifact} />;
    case "LINK":
      return <LinkArtifact artifact={artifact} />;
    default:
      return null;
  }
};

export default ArtifactDisplay;
