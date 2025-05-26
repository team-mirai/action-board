import clsx from "clsx";

export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

export function FormMessage({
  className,
  message,
}: { className?: string; message: Message }) {
  return (
    <div
      className={clsx("flex flex-col gap-2 w-full max-w-md text-sm", className)}
    >
      {"success" in message && (
        <div className="text-foreground border-l-2 border-foreground px-4 whitespace-pre-wrap">
          {message.success}
        </div>
      )}
      {"error" in message && (
        <div className="text-destructive border-l-2 border-destructive px-4 whitespace-pre-wrap">
          {message.error}
        </div>
      )}
      {"message" in message && (
        <div className="text-foreground border-l-2 px-4 whitespace-pre-wrap">
          {message.message}
        </div>
      )}
    </div>
  );
}
