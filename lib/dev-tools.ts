// 開発環境でのみ使用するユーティリティ
export function createOgpUrl(baseUrl: string, imageUrl: string): string {
  return `${baseUrl}?ogp=${encodeURIComponent(imageUrl)}`;
}

export function validateOgpImage(url: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!url) {
    errors.push("画像URLが入力されていません");
    return { isValid: false, errors };
  }
  
  try {
    const urlObj = new URL(url);
    
    if (urlObj.protocol !== 'https:') {
      errors.push("HTTPSプロトコルが必要です");
    }
    
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const pathname = urlObj.pathname.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => pathname.endsWith(ext));
    
    if (!hasValidExtension) {
      errors.push(`有効な画像拡張子が必要です (${validExtensions.join(', ')})`);
    }
    
  } catch {
    errors.push("有効なURLではありません");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
