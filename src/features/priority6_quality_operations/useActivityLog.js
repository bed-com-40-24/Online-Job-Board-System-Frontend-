import { useState, useEffect, useMemo, useCallback } from "react";

const STORAGE_KEY = "talentbridge-activity-log-v1";

const initialActivityData = [
  { id: 101, text: "Northstar Digital submitted Digital Marketing Assistant vacancy", time: "Today, 09:42", type: "Job review" },
  { id: 102, text: "Tadala Phiri was shortlisted for Frontend Developer role", time: "Yesterday, 14:20", type: "Application" },
  { id: 103, text: "Lakeview Systems registered an employer account", time: "21 Oct, 11:06", type: "Employer" },
  { id: 104, text: "Platform admin verified Mwayi Foundation credentials", time: "20 Oct, 16:15", type: "System" },
  { id: 105, text: "IT Support Technician status changed to Approved", time: "18 Oct, 08:30", type: "Job review" }
];

/**
 * Custom hook providing Platform Activity Monitoring (AFR09)
 * with Frontend Performance Optimisation (NFR06) and Reliability (NFR07).
 */
export function useActivityLog() {
  // Issue #28 (NFR07): Safe parsing with try/catch fallback for storage state
  const [activities, setActivities] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : initialActivityData;
    } catch (err) {
      console.warn("[Priority6-useActivityLog] Failed reading localStorage:", err);
      return initialActivityData;
    }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");

  // Sync state to local storage with error boundaries
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
    } catch (err) {
      console.error("[Priority6-useActivityLog] Storage save error:", err);
    }
  }, [activities]);

  /**
   * Issue #21 (AFR09): Log a new platform activity event
   */
  const logActivity = useCallback((text, type = "Update") => {
    if (!text || typeof text !== "string") return;

    const newEvent = {
      id: Date.now(),
      text: text.trim(),
      time: "Just now",
      type: type || "Update"
    };

    setActivities((prev) => [newEvent, ...prev].slice(0, 50));
  }, []);

  /**
   * Clear all activities safely
   */
  const clearActivityLog = useCallback(() => {
    setActivities([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("[Priority6-useActivityLog] Failed clearing localStorage:", err);
    }
  }, []);

  /**
   * Reset activity log to demo default state
   */
  const resetActivityLog = useCallback(() => {
    setActivities(initialActivityData);
  }, []);

  /**
   * Issue #27 (NFR06): Memoized search & filter for high frontend performance
   */
  const filteredActivities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return activities.filter((act) => {
      const matchesSearch = !query || act.text.toLowerCase().includes(query) || act.type.toLowerCase().includes(query);
      const matchesType = selectedType === "All" || act.type.toLowerCase() === selectedType.toLowerCase();
      return matchesSearch && matchesType;
    });
  }, [activities, searchQuery, selectedType]);

  /**
   * Issue #27 (NFR06) & #21 (AFR09): Memoized activity metrics and statistics
   */
  const stats = useMemo(() => {
    const total = activities.length;
    const countsByType = activities.reduce((acc, act) => {
      acc[act.type] = (acc[act.type] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      jobReviews: countsByType["Job review"] || 0,
      applications: countsByType["Application"] || 0,
      employers: countsByType["Employer"] || 0,
      systemEvents: countsByType["System"] || 0,
      updates: countsByType["Update"] || 0,
      latestEvent: activities[0] || null
    };
  }, [activities]);

  /**
   * Export activity log as JSON file (Reliability feature)
   */
  const exportActivityLog = useCallback(() => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activities, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `talentbridge_activity_log_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      return true;
    } catch (err) {
      console.error("[Priority6-useActivityLog] Export error:", err);
      return false;
    }
  }, [activities]);

  return {
    activities,
    filteredActivities,
    stats,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    logActivity,
    clearActivityLog,
    resetActivityLog,
    exportActivityLog
  };
}
