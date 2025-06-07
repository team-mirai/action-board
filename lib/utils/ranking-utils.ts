export const getLevelBadgeColor = (level: number): string => {
  if (level >= 40) return "bg-purple-500 text-white";
  if (level >= 30) return "bg-red-500 text-white";
  if (level >= 20) return "bg-orange-500 text-white";
  if (level >= 10) return "bg-teal-500 text-white";
  return "bg-gray-500 text-white";
};

export const formatUserDisplayName = (name: string | null): string => {
  return name || "名前未設定";
};

export const formatUserPrefecture = (prefecture: string | null): string => {
  return prefecture || "未設定";
};
