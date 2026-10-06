import { LoaderCircle } from "lucide-react";

export default function LoadingState({ label = "Loading" }) {
  return (
    <div className="flex min-h-36 items-center justify-center gap-3 text-sm text-slate-600" role="status">
      <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin text-blue-700" />
      <span>{label}</span>
    </div>
  );
}