import clsx from "clsx";
import { CheckCircle, Info, XCircle } from "lucide-react";

export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

export function FormMessage({
  className,
  message,
}: { className?: string; message: Message }) {
  if (
    !message ||
    !("success" in message || "error" in message || "message" in message)
  )
    return null;

  return (
    <div
      className={clsx(
        "relative flex items-start gap-3 w-full max-w-md p-4 rounded-xl",
        "border text-card-foreground shadow-soft-lg",
        {
          "bg-green-50 border-green-200": "success" in message,
          "bg-red-50 border-red-200": "error" in message,
          "bg-blue-50 border-blue-200": "message" in message,
        },
        className,
      )}
    >
      {"success" in message && (
        <div className="flex-1">
          <div className="text-sm text-green-700 whitespace-pre-wrap leading-relaxed">
            {message.success}
          </div>
        </div>
      )}
      {"error" in message && (
        <div className="flex-1">
          <div className="text-sm text-red-700 whitespace-pre-wrap leading-relaxed">
            {message.error}
          </div>
        </div>
      )}
      {"message" in message && (
        <div className="flex-1">
          <div className="text-sm text-blue-700 whitespace-pre-wrap leading-relaxed">
            {message.message}
          </div>
        </div>
      )}
    </div>
  );
}
