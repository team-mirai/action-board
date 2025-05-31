"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createOgpUrl, validateOgpImage } from "@/lib/dev-tools";
import { useState } from "react";
import { AlertCircle, CheckCircle, Copy } from "lucide-react";

export function OgpTester() {
  const [imageUrl, setImageUrl] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [validation, setValidation] = useState<{
    isValid: boolean;
    errors: string[];
  }>({ isValid: true, errors: [] });

  const handleValidation = (url: string) => {
    const result = validateOgpImage(url);
    setValidation(result);
    return result.isValid;
  };

  const generateOgpUrl = () => {
    if (!handleValidation(imageUrl)) return;
    
    const baseUrl = window.location.origin;
    const ogpUrl = createOgpUrl(baseUrl, imageUrl);
    setGeneratedUrl(ogpUrl);
  };

  const copyToClipboard = async () => {
    if (generatedUrl) {
      try {
        await navigator.clipboard.writeText(generatedUrl);
        // より良いUX: toast通知などに置き換え可能
        alert("URLがクリップボードにコピーされました");
      } catch (err) {
        console.error("コピーに失敗しました:", err);
      }
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔧 OGP URL テスター
        </CardTitle>
        <CardDescription>
          開発・テスト用のOGP URL生成ツール
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium mb-2">
            OGP画像URL
          </label>
          <Input
            id="imageUrl"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              if (e.target.value) {
                handleValidation(e.target.value);
              } else {
                setValidation({ isValid: true, errors: [] });
              }
            }}
          />
        </div>

        {!validation.isValid && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside">
                {validation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {validation.isValid && imageUrl && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              有効な画像URLです
            </AlertDescription>
          </Alert>
        )}
        
        <Button 
          onClick={generateOgpUrl} 
          className="w-full"
          disabled={!validation.isValid || !imageUrl}
        >
          OGP URL を生成
        </Button>
        
        {generatedUrl && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              生成されたURL
            </label>
            <div className="bg-muted p-3 rounded break-all text-sm font-mono">
              {generatedUrl}
            </div>
            <Button 
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              URLをコピー
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>要件：</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>HTTPS プロトコル必須</li>
            <li>対応形式: .jpg, .jpeg, .png, .webp, .gif</li>
            <li>推奨サイズ: 1200×630px</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}