const API_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') + '/api'
  : 'http://localhost:3001/api';

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
  // Generate deterministic pseudo-random scores based on event ID
  let hash = 0;
  const strId = (e.id || '').toString();
  for (let i = 0; i < strId.length; i++) {
    hash = ((hash << 5) - hash) + strId.charCodeAt(i);
    hash = hash & hash;
  }
  const seed = Math.abs(hash);
  const score1 = (seed % 4).toString();
  const score2 = ((seed >> 2) % 3).toString();

  return {
    id: e.id,
    sport: e.sport,
    league: e.league,
    time: new Date(e.eventDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
    team1: e.teamHome,
    team2: e.teamAway,
    score1: score1,
    score2: score2,
    ratio: { win1, draw: draw > 0 ? draw : null, win2 },
    isLive: e.status === 'open' && new Date(e.eventDate).getTime() > Date.now(),
    isClosed: e.status !== 'open' || new Date(e.eventDate).getTime() <= Date.now(),
    marketAddress: e.marketAddress
  };
};

export const mapEventToMatchDetail = (e: any) => {
  const match = mapEventToMatch(e);
  if (!e.details) {
    // Generate default details if none exist in DB
    return {
      id: e.id,
      match,
      date: new Date(e.eventDate).toLocaleDateString(),
      time: new Date(e.eventDate).toLocaleTimeString(),
      stats: { wins: [0, 0, 0], corners: [0, 0], possession: [50, 50], shotsOnTarget: ["0 (0)", "0 (0)"] },
      team1: { form: ["-", "-", "-", "-", "-"], name: e.teamHome, color: "#ffffff", league: e.league, manager: "-", keyPlayer: { xp: 0, name: "-", role: "-", goals: 0, assists: 0 }, shortName: e.teamHome.substring(0, 3).toUpperCase() },
      team2: { form: ["-", "-", "-", "-", "-"], name: e.teamAway, color: "#ffffff", league: e.league, manager: "-", keyPlayer: { xp: 0, name: "-", role: "-", goals: 0, assists: 0 }, shortName: e.teamAway.substring(0, 3).toUpperCase() },
      venue: "TBD",
      markets: []
    };
  }
  return {
    id: e.id,
    match,
    ...e.details
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
  return events
    .filter((e: any) => e.status !== 'resolved' && e.status !== 'settled')
    .map(mapEventToMatch);
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

export const createNewEvent = async (eventData: any) => {
  try {
    const response = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
    
    if (!response.ok) {
      throw new Error(`Error creating event: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to create event:', error);
    throw error;
  }
};

export const fetchEventBets = async (eventId: string) => {
  try {
    const response = await fetch(`${API_URL}/events/${eventId}/bets`);
    if (!response.ok) {
      throw new Error(`Error fetching bets: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch bets for event ${eventId}:`, error);
    return [];
  }
};
