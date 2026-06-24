import { useState, useEffect } from "react";
import { Lead } from "../types";
import { fetchLeads } from "../api/leads";

interface UseLeadsOptions {
  defaultLeads: Lead[];
  version?: number;
}

export function useLeads({ defaultLeads, version = 5 }: UseLeadsOptions) {
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const savedVersion = localStorage.getItem("nova_leads_version");
      if (savedVersion !== String(version)) {
        localStorage.setItem("nova_leads_version", String(version));
        localStorage.removeItem("nova_leads");
        return defaultLeads;
      }
      const saved = localStorage.getItem("nova_leads");
      return saved ? JSON.parse(saved) : defaultLeads;
    } catch { return defaultLeads; }
  });

  useEffect(() => { localStorage.setItem("nova_leads", JSON.stringify(leads)); }, [leads]);

  // Sync from backend on mount
  useEffect(() => {
    fetchLeads()
      .then((apiLeads) => {
        if (apiLeads && apiLeads.length > 0) {
          setLeads(apiLeads);
          localStorage.setItem("nova_leads", JSON.stringify(apiLeads));
        }
      })
      .catch(() => {});
  }, []);

  return { leads, setLeads };
}
