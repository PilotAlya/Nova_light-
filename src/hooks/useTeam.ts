import { useState, useEffect } from "react";
import { TeamMember } from "../types";
import { loadData, saveData } from "../api/sync";

export function useTeam(initialTeam: Record<string, TeamMember>) {
  const [teamMembers, setTeamMembers] = useState<Record<string, TeamMember>>(() => {
    if (typeof window === "undefined") return initialTeam;
    const saved = localStorage.getItem("nova_team");
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, ...initialTeam };
    }
    return initialTeam;
  });

  useEffect(() => {
    localStorage.setItem("nova_team", JSON.stringify(teamMembers));
  }, [teamMembers]);
  useEffect(() => { saveData("team", teamMembers); }, [teamMembers]);
  useEffect(() => {
    loadData<Record<string, TeamMember>>("team").then(d => {
      if (d && Object.keys(d).length) setTeamMembers(d);
    });
  }, []);

  const getAvatarByName = (name: string) =>
    Object.values(teamMembers).find((member) => member.name === name)?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff`;

  return { team: teamMembers, setTeamMembers, getAvatarByName };
}
