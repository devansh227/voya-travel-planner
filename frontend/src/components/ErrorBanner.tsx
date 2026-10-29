import { ApiError } from "../api/client";

const TITLES: Record<string, string> = {
  network: "Can't reach the server",
  timeout: "That took too long",
  rate_limit: "AI service is busy",
  unavailable: "Something went wrong on the server",
  validation: "Check your request",
  invalid_response: "Unexpected response",
  unknown: "Something went wrong",
};

interface Props {
  error: unknown;
  onRetry?: () => void;
  retryLabel?: string;
}

export default function ErrorBanner({ error, onRetry, retryLabel }: Props) {
  const kind = error instanceof ApiError ? error.kind : "unknown";
  const message =
    error instanceof Error ? error.message : "An unexpected error occurred.";
  return (
    <div className="error-banner" role="alert">
      <div>
        <strong>{TITLES[kind] ?? TITLES.unknown}</strong>
        <p>{message}</p>
      </div>
      {onRetry && kind !== "validation" && (
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          {retryLabel ?? "Try again"}
        </button>
      )}
    </div>
  );
}
