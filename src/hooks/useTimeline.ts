import { useState, useEffect } from "react";
import { TimelineEntry } from "../types";
import { loadData, saveData } from "../api/sync";

interface UseTimelineOptions {
  defaultTimeline: TimelineEntry[];
  version?: number;
}

export function useTimeline({ defaultTimeline, version = 1 }: UseTimelineOptions) {
  const [projectTimeline, setProjectTimeline] = useState<TimelineEntry[]>(() => {
    try {
      const savedVersion = localStorage.getItem("nova_timeline_version");
      if (savedVersion !== String(version)) {
        localStorage.setItem("nova_timeline_version", String(version));
        localStorage.removeItem("nova_timeline");
        return defaultTimeline;
      }
      const saved = localStorage.getItem("nova_timeline");
      return saved ? JSON.parse(saved) : defaultTimeline;
    } catch {
      return defaultTimeline;
    }
  });

  useEffect(() => {
    localStorage.setItem("nova_timeline", JSON.stringify(projectTimeline));
  }, [projectTimeline]);
  useEffect(() => { saveData("timeline", projectTimeline); }, [projectTimeline]);
  useEffect(() => {
    loadData<TimelineEntry[]>("timeline").then(d => {
      if (d && d.length) setProjectTimeline(d);
    });
  }, []);

  const saveTimeline = (entries: TimelineEntry[]) => {
    setProjectTimeline(entries);
    localStorage.setItem("nova_timeline", JSON.stringify(entries));
    saveData("timeline", entries);
  };

  return { projectTimeline, saveTimeline };
}
