import { CircleAlert } from "lucide-react";

export default function SetupNotice({ compact = false }) {
  return (
    <div className="flex gap-3 border border-amber-300 bg-amber-50 px-4 py-3 text-amber-950">
      <CircleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="text-sm font-semibold">Offline Mode</p>
        <p className="mt-1 text-sm leading-6 text-amber-900">
          Firebase has been removed. The app is currently running in an offline mode using localStorage. Data will not persist across different browsers.
        </p>
      </div>
    </div>
  );
}