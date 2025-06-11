"use client";

import {
  type MapShape as MapShapeData,
  deleteShape as deleteMapShape,
  loadShapes as loadMapShapes,
  saveShape as saveMapShape,
  updateShape as updateMapShape,
} from "@/lib/services/posting";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";

const GeomanMap = dynamic(() => import("@/components/GeomanMap"), {
  ssr: false,
});

interface PostingPageClientProps {
  userId: string;
}

export default function PostingPageClient({ userId }: PostingPageClientProps) {
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [shapeCount, setShapeCount] = useState(0);
  const autoSave = true;

  useEffect(() => {
    if (!mapInstance) return;

    const initializePostingMap = async () => {
      const L = (await import("leaflet")).default;

      console.log("Map instance received, pm available:", !!mapInstance.pm);

      L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution:
          '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>',
      }).addTo(mapInstance);

      mapInstance.pm.addControls({
        position: "topleft",
        // 以下はデフォルトでtrue
        drawMarker: false,
        drawCircleMarker: false,
        drawPolyline: false,
        drawRectangle: false,
        drawPolygon: true,
        drawCircle: false,
        drawText: true,
        // modes
        editMode: true,
        dragMode: true,
        cutPolygon: false,
        removalMode: true,
        rotateMode: false,
        oneBlock: false,
        // controls
        drawControls: true,
        editControls: true,
        optionsControls: false,
        customControls: false, // これ何か不明
        // 以下はデフォルトでfalse
      });

      console.log("Geoman controls added successfully");

      mapInstance.on("pm:create", async (e: any) => {
        console.log("Shape created:", e.layer);
        if (e.layer) {
          await saveOrUpdateLayer(e.layer);
          attachTextEvents(e.layer);
          updateShapeCount();
        }
      });

      mapInstance.on("pm:remove", async (e: any) => {
        console.log("Shape removed:", e.layer);
        const layer = e.layer;
        const sid = getShapeId(layer);
        if (sid) {
          await deleteMapShape(sid);
        }
        updateShapeCount();
      });

      mapInstance.on("pm:update", async (e: any) => {
        console.log("Shape updated:", e.layer);
        await saveOrUpdateLayer(e.layer);
      });

      mapInstance.on("pm:cut", (e: any) => {
        console.log("Shape cut:", e);
      });

      mapInstance.on("pm:undo", (e: any) => {
        console.log("Undo action:", e);
      });

      mapInstance.on("pm:redo", (e: any) => {
        console.log("Redo action:", e);
      });

      mapInstance.pm.setPathOptions({
        snappable: true,
        snapDistance: 20,
      });

      loadExistingShapes();
    };

    const loadExistingShapes = async () => {
      try {
        const savedShapes = await loadMapShapes();
        const L = (await import("leaflet")).default;

        savedShapes.forEach((shape: any) => {
          try {
            let layer;

            if (
              shape.type === "text" ||
              shape.properties?.originalType === "Text"
            ) {
              const [lng, lat] = shape.coordinates.coordinates;
              const text = shape.properties?.text || "";
              layer = L.marker([lat, lng], {
                textMarker: true,
                text,
              });
              (layer as any)._shapeId = shape.id; // preserve id
              attachTextEvents(layer);
            } else if (
              shape.coordinates.type === "Point" &&
              shape.properties?.originalType === "Circle"
            ) {
              const [lng, lat] = shape.coordinates.coordinates;
              const radius = shape.properties.radius || 100;
              layer = L.circle([lat, lng], { radius });
              (layer as any)._shapeId = shape.id; // preserve id
              attachTextEvents(layer);
            } else {
              layer = L.geoJSON(shape.coordinates);
              (layer as any)._shapeId = shape.id; // preserve id
              attachTextEvents(layer);
            }

            layer.addTo(mapInstance);

            propagateShapeId(layer, shape.id);

            if (
              shape.type === "text" ||
              shape.properties?.originalType === "Text"
            ) {
              attachTextEvents(layer);
            }

            console.log("Loaded shape:", shape.type);
          } catch (layerError) {
            console.error(
              "Failed to create layer for shape:",
              shape,
              layerError,
            );
          }
        });

        console.log("Loaded existing shapes:", savedShapes.length);
        updateShapeCount();
      } catch (error) {
        console.error("Failed to load existing shapes:", error);
      }
    };

    initializePostingMap();
  }, [mapInstance]);

  const getAllDrawnLayers = () => {
    if (!mapInstance) return [];

    const L = (window as any).L;
    const allLayers: any[] = [];

    mapInstance.eachLayer((layer: any) => {
      if (layer instanceof L.Path || layer instanceof L.Marker) {
        if (layer.pm && !layer._url) {
          allLayers.push(layer);
        }
      }
    });

    return allLayers;
  };

  const updateShapeCount = () => {
    const drawnLayers = getAllDrawnLayers();
    setShapeCount(drawnLayers.length);
    console.log("Shape count updated:", drawnLayers.length);
  };

  const saveCurrentMapState = async () => {
    if (!mapInstance) return;

    try {
      const existingShapes = await loadMapShapes();
      for (const shape of existingShapes) {
        await deleteMapShape(shape.id);
      }

      const L = (window as any).L;
      const drawnLayers: any[] = [];

      mapInstance.eachLayer((layer: any) => {
        if (
          (layer instanceof L.Path || layer instanceof L.Marker) &&
          layer.pm &&
          !layer._url
        ) {
          drawnLayers.push(layer);
        }
      });

      if (drawnLayers.length === 0) {
        console.log("No shapes to save - clearing database");
        return;
      }

      const savedShapes = [];
      for (const layer of drawnLayers) {
        let shape: MapShapeData;

        const shapeName = layer.pm?.getShape ? layer.pm.getShape() : undefined;

        if (shapeName === "Text") {
          const center = layer.getLatLng();
          const textContent = layer.pm?.getText ? layer.pm.getText() : "";

          shape = {
            type: "text",
            coordinates: {
              type: "Point",
              coordinates: [center.lng, center.lat],
            },
            properties: {
              text: textContent,
              originalType: "Text",
            },
          };
        } else if (layer instanceof L.Circle) {
          const center = layer.getLatLng();
          const radius = layer.getRadius();

          shape = {
            type: "circle",
            coordinates: {
              type: "Point",
              coordinates: [center.lng, center.lat],
            },
            properties: {
              radius: radius,
              originalType: "Circle",
            },
          };
        } else {
          const geoJSON = layer.toGeoJSON();
          shape = {
            type: geoJSON.geometry.type.toLowerCase() as MapShapeData["type"],
            coordinates: geoJSON.geometry,
            properties: {
              ...geoJSON.properties,
              originalType: geoJSON.geometry.type,
            },
          };
        }

        const savedShape = await saveMapShape(shape);
        savedShapes.push(savedShape);
      }

      console.log(`Saved ${savedShapes.length} shapes to database`);
    } catch (error) {
      console.error("Failed to save map state:", error);
    }
  };

  const saveAllShapes = async () => {
    const layers = getAllDrawnLayers();
    for (const l of layers) {
      await saveOrUpdateLayer(l);
    }
    console.log("Manual save complete");
  };

  const unsavedCount = autoSave ? 0 : shapeCount;

  const textMarkerStyles = `
    .pm-text {
      font-size:14px;
      color:#000;
    }
  `;

  function attachTextEvents(layer: any) {
    if (!layer || !layer.pm) return;

    layer.off("pm:textchange");
    layer.off("pm:textblur");

    layer.on("pm:textchange", () => {
      (layer as any)._textDirty = true;
    });

    layer.on("pm:textblur", () => {
      if ((layer as any)._textDirty) {
        console.log("Text layer changed -> saving");
        (layer as any)._textDirty = false;
        if (autoSave) saveOrUpdateLayer(layer);
      }
    });
  }

  const extractShapeData = (layer: any): MapShapeData => {
    const L = (window as any).L;
    if (!L) throw new Error("Leaflet not loaded");

    const shapeName = layer.pm?.getShape ? layer.pm.getShape() : undefined;

    if (shapeName === "Text") {
      const center = layer.getLatLng();
      const textContent = layer.pm?.getText ? layer.pm.getText() : "";
      return {
        type: "text",
        coordinates: {
          type: "Point",
          coordinates: [center.lng, center.lat],
        },
        properties: { text: textContent, originalType: "Text" },
      };
    }

    if (layer instanceof L.Circle) {
      const center = layer.getLatLng();
      const radius = layer.getRadius();
      return {
        type: "circle",
        coordinates: { type: "Point", coordinates: [center.lng, center.lat] },
        properties: { radius, originalType: "Circle" },
      };
    }

    const geoJSON = layer.toGeoJSON();
    return {
      type: geoJSON.geometry.type.toLowerCase() as MapShapeData["type"],
      coordinates: geoJSON.geometry,
      properties: {
        ...geoJSON.properties,
        originalType: geoJSON.geometry.type,
      },
    };
  };

  const saveOrUpdateLayer = async (layer: any) => {
    const shapeData = extractShapeData(layer);
    const sid = getShapeId(layer);
    if (sid) {
      await updateMapShape(sid, {
        coordinates: shapeData.coordinates,
        properties: shapeData.properties,
      });
    } else {
      const saved = await saveMapShape(shapeData);
      propagateShapeId(layer, saved.id);
      return saved;
    }
  };

  const saveOrUpdateShapeRecord = async (layer: any, shape: MapShapeData) => {
    const sid = getShapeId(layer);
    if (sid) {
      return await updateMapShape(sid, {
        coordinates: shape.coordinates,
        properties: shape.properties,
      });
    } else {
      const saved = await saveMapShape(shape);
      propagateShapeId(layer, saved.id);
      return saved;
    }
  };

  function propagateShapeId(layer: any, id: string) {
    if (!layer) return;
    (layer as any)._shapeId = id;
    if (layer.options) (layer.options as any).shapeId = id;
    if (layer.feature && layer.feature.properties) {
      layer.feature.properties._shapeId = id;
    }
    if (layer.getLayers) {
      layer.getLayers().forEach((sub: any) => propagateShapeId(sub, id));
    }

    attachPersistenceEvents(layer);
  }

  function attachPersistenceEvents(layer: any) {
    if (!layer || !layer.pm) return;

    layer.off("pm:change", onLayerChange);
    layer.off("pm:dragend", onLayerChange);

    layer.on("pm:change", onLayerChange);
    layer.on("pm:dragend", onLayerChange);
  }

  const onLayerChange = async (e: any) => {
    const layer = e.layer || e.target;
    await saveOrUpdateLayer(layer);
  };

  const getShapeId = (layer: any): string | undefined => {
    return (
      (layer as any)._shapeId ||
      layer?.options?.shapeId ||
      layer?.feature?.properties?._shapeId
    );
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <link
        rel="stylesheet"
        href="https://unpkg.com/@geoman-io/leaflet-geoman-free@2.18.3/dist/leaflet-geoman.css"
      />

      {/* Control Panel */}
      <div
        style={{
          position: "fixed",
          top: "10px",
          right: "10px",
          zIndex: 1000,
          background: "white",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <div style={{ fontSize: "12px", color: "#666" }}>
          Shapes: {shapeCount}
        </div>

        {/* Auto-save is always on; checkbox removed */}
      </div>

      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
        }
        #map {
          width: 100%;
          height: 100vh;
          position: relative;
        }
        /* Ensure Geoman toolbar is visible */
        .leaflet-pm-toolbar {
          z-index: 1000 !important;
        }
        
        .leaflet-pm-icon {
          background-color: white !important;
          border: 1px solid #ccc !important;
        }

        ${textMarkerStyles}
      `}</style>

      <GeomanMap onMapReady={setMapInstance} />
    </>
  );
}
