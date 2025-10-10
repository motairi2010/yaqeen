import React from "react";
import { http } from "../lib/http";

export default function ApiStatusBadge() {
  const [ok, setOk] = React.useState(null);

  React.useEffect(() => {
    let stop = false;
    const ping = async () => {
      try {
        await http.get("/health");
        if (!stop) setOk(true);
      } catch {
        if (!stop) setOk(false);
      }
    };
    ping();
    const id = setInterval(ping, 10000);
    return () => { stop = true; clearInterval(id); };
  }, []);

  const base = "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs";
  if (ok === null) return <span className={base + " bg-gray-200"}>API…</span>;
  if (ok) return <span className={base + " bg-green-200"}>API OK</span>;
  return <span className={base + " bg-red-200"}>API Down</span>;
}
