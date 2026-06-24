export type SpecialistRole = 'measurer' | 'designer';
export type SpecialistStatus = 'on-site' | 'busy' | 'available';

export interface Specialist {
  id: string;
  name: string;
  role: SpecialistRole;
  status: SpecialistStatus;
  efficiencyScore: number;
  activeTasksLimit: number;
  currentTaskId: string | null;
  avatar: string;
}

export interface RoutingLog {
  name: string;
  L: string;
  R: string;
  efficiency: number;
  active: number;
  limit: number;
}

export interface RoutingResult {
  bestDesigner: Specialist | null;
  logs: RoutingLog[];
  maxScore: number;
}

export function runSmartRouting(specialists: Specialist[]): RoutingResult {
  const designers = specialists.filter((s) => s.role === 'designer');

  let bestDesigner: Specialist | null = null;
  let maxScore = -1;
  const logs: RoutingLog[] = [];

  designers.forEach((designer) => {
    const activeCount = designer.currentTaskId ? 1 : 0;

    const L = (activeCount / designer.activeTasksLimit) * 100;

    const R = designer.efficiencyScore * (1 - L / 100);

    logs.push({
      name: designer.name,
      L: L.toFixed(1),
      R: R.toFixed(3),
      efficiency: designer.efficiencyScore,
      active: activeCount,
      limit: designer.activeTasksLimit,
    });

    if (R > maxScore && L < 100) {
      maxScore = R;
      bestDesigner = designer;
    }
  });

  return { bestDesigner, logs, maxScore };
}
