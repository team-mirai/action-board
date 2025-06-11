import { createClient } from "@/lib/supabase/client";

export interface MapShape {
  id?: string;
  user_id?: string;
  type:
    | "marker"
    | "rectangle"
    | "polyline"
    | "polygon"
    | "circle"
    | "point"
    | "linestring"
    | "text";
  coordinates: any;
  properties?: any;
  created_at?: string;
  updated_at?: string;
}

const supabase = createClient();

export async function saveShape(shape: MapShape) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated to save shapes");
  }

  const nowISO = new Date().toISOString();

  const shapeWithMeta = {
    ...shape,
    user_id: user.id,
    id: shape.id ?? crypto.randomUUID(),
    created_at: shape.created_at ?? nowISO,
    updated_at: shape.updated_at ?? nowISO,
  };

  const { data, error } = await supabase
    .from("posting_shapes")
    .insert([shapeWithMeta])
    .select()
    .single();

  if (error) {
    console.error("Error saving shape:", error);
    throw error;
  }

  return data;
}

export async function deleteShape(id: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated to delete shapes");
  }

  const { error } = await supabase
    .from("posting_shapes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id); // Ensure user can only delete their own shapes

  if (error) {
    console.error("Error deleting shape:", error);
    throw error;
  }
}

export async function loadShapes() {
  const { data, error } = await supabase
    .from("posting_shapes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading shapes:", error);
    throw error;
  }

  return data || [];
}

export async function updateShape(id: string, data: Partial<MapShape>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated to update shapes");
  }

  const updateData = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  const { data: rows, error } = await supabase
    .from("posting_shapes")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id) // Ensure user can only update their own shapes
    .select()
    .single();

  if (error) {
    console.error("Error updating shape:", error);
    throw error;
  }

  return rows;
}
