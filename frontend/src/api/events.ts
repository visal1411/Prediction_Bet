const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const mapEventToMatch = (e: any) => {
  let win1 = 60, draw = 10, win2 = 30;
  try {
    const total = BigInt(e.totalPool || '0');
    if (total > 0n) {
        win1 = Number((BigInt(e.poolHome || '0') * 100n) / total);
        draw = Number((BigInt(e.poolDraw || '0') * 100n) / total);
        win2 = Number((BigInt(e.poolAway || '0') * 100n) / total);
    }
  } catch(err) {}
  
  return {
    id: e.id,
    sport: e.sport,
    league: e.league,
    time: new Date(e.eventDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
    team1: e.teamHome,
    team2: e.teamAway,
    score1: '-',
    score2: '-',
    ratio: { win1, draw: draw > 0 ? draw : null, win2 },
    isLive: e.status === 'open'
  };
};

export const fetchEvents = async (status?: string, sport?: string, isDemo?: boolean) => {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (sport) params.append('sport', sport);
    if (isDemo !== undefined) params.append('isDemo', isDemo.toString());

    const response = await fetch(`${API_URL}/events?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Error fetching events: ${response.statusText}`);
    }
    const events = await response.json();
    return events;
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return [];
  }
};

export const fetchMappedMatches = async (status?: string, sport?: string, isDemo?: boolean) => {
  const events = await fetchEvents(status, sport, isDemo);
  return events.map(mapEventToMatch);
};

export const fetchEventById = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/events/${id}`);
    if (!response.ok) {
      throw new Error(`Error fetching event: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch event with id ${id}:`, error);
    return null;
  }
};
