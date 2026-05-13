// Parse Spotify Extended Streaming History JSON files and compute aggregates.

export function parseFiles(records) {
  const valid = records.filter(r => r && r.ts && typeof r.ms_played === 'number');

  let totalMs = 0;
  const byArtist = new Map();
  const byTrack = new Map();
  const byAlbum = new Map();
  const byYear = new Map();
  const byMonth = new Map(); // yyyy-mm
  const byPlatform = new Map();
  const byCountry = new Map();

  let skipCount = 0;
  let shuffleCount = 0;
  let offlineCount = 0;

  let firstTs = null;
  let lastTs = null;

  for (const r of valid) {
    const ms = r.ms_played || 0;
    totalMs += ms;

    const ts = new Date(r.ts);
    if (!firstTs || ts < firstTs) firstTs = ts;
    if (!lastTs || ts > lastTs) lastTs = ts;

    const year = ts.getUTCFullYear();
    const month = String(ts.getUTCMonth() + 1).padStart(2, '0');
    const ymKey = `${year}-${month}`;

    byYear.set(year, (byYear.get(year) || 0) + ms);
    byMonth.set(ymKey, (byMonth.get(ymKey) || 0) + ms);

    if (r.skipped) skipCount++;
    if (r.shuffle) shuffleCount++;
    if (r.offline) offlineCount++;

    if (r.conn_country) {
      byCountry.set(r.conn_country, (byCountry.get(r.conn_country) || 0) + ms);
    }

    if (r.platform) {
      const plat = simplifyPlatform(r.platform);
      byPlatform.set(plat, (byPlatform.get(plat) || 0) + ms);
    }

    const artist = r.master_metadata_album_artist_name;
    const track = r.master_metadata_track_name;
    const album = r.master_metadata_album_album_name;

    if (artist) {
      const entry = byArtist.get(artist) || { name: artist, ms: 0, plays: 0, firstTs: ts };
      entry.ms += ms;
      entry.plays += 1;
      if (ts < entry.firstTs) entry.firstTs = ts;
      byArtist.set(artist, entry);
    }

    if (track && artist) {
      const key = `${track}${artist}`;
      const entry = byTrack.get(key) || {
        name: track,
        artist,
        album: album || '',
        uri: r.spotify_track_uri || '',
        ms: 0,
        plays: 0,
        firstTs: ts,
      };
      entry.ms += ms;
      entry.plays += 1;
      if (ts < entry.firstTs) entry.firstTs = ts;
      byTrack.set(key, entry);
    }

    if (album && artist) {
      const key = `${album}${artist}`;
      const entry = byAlbum.get(key) || { name: album, artist, ms: 0, plays: 0, firstTs: ts };
      entry.ms += ms;
      entry.plays += 1;
      if (ts < entry.firstTs) entry.firstTs = ts;
      byAlbum.set(key, entry);
    }
  }

  const topArtists = [...byArtist.values()].sort((a, b) => b.ms - a.ms);
  const topTracks = [...byTrack.values()].sort((a, b) => b.ms - a.ms);
  const topAlbums = [...byAlbum.values()].sort((a, b) => b.ms - a.ms);

  const yearSeries = [...byYear.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([year, ms]) => ({ year, ms }));

  const monthSeries = [...byMonth.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, ms]) => ({ key, ms }));

  const platforms = [...byPlatform.entries()]
    .map(([name, ms]) => ({ name, ms }))
    .sort((a, b) => b.ms - a.ms);

  const countries = [...byCountry.entries()]
    .map(([name, ms]) => ({ name, ms }))
    .sort((a, b) => b.ms - a.ms);

  return {
    totalMs,
    totalPlays: valid.length,
    uniqueArtists: byArtist.size,
    uniqueTracks: byTrack.size,
    uniqueAlbums: byAlbum.size,
    firstTs,
    lastTs,
    skipCount,
    shuffleCount,
    offlineCount,
    topArtists,
    topTracks,
    topAlbums,
    yearSeries,
    monthSeries,
    platforms,
    countries,
    validRecords: valid,
  };
}

// Hour and weekday breakdown in a given timezone.
// Monday-first weekday ordering: 0=Mon ... 6=Sun.
export function computeTimeBreakdown(records, timeZone) {
  const partsFmt = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    weekday: 'short',
  });
  const weekdayIndex = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

  const byHour = new Array(24).fill(0);
  const byWeekday = new Array(7).fill(0);
  const distinctDates = new Set();
  const distinctDatesByWeekday = Array.from({ length: 7 }, () => new Set());

  for (const r of records) {
    if (!r || !r.ts || typeof r.ms_played !== 'number') continue;
    const ts = new Date(r.ts);
    const parts = partsFmt.formatToParts(ts);
    let year, month, day, hour, weekday;
    for (const p of parts) {
      if (p.type === 'year') year = p.value;
      else if (p.type === 'month') month = p.value;
      else if (p.type === 'day') day = p.value;
      else if (p.type === 'hour') hour = +p.value;
      else if (p.type === 'weekday') weekday = weekdayIndex[p.value];
    }
    if (hour === 24) hour = 0;
    if (weekday == null) continue;

    byHour[hour] += r.ms_played;
    byWeekday[weekday] += r.ms_played;
    const dateKey = `${year}-${month}-${day}`;
    distinctDates.add(dateKey);
    distinctDatesByWeekday[weekday].add(dateKey);
  }

  const totalDays = distinctDates.size || 1;
  const avgByHour = byHour.map(ms => ms / totalDays);
  const avgByWeekday = byWeekday.map((ms, i) => ms / (distinctDatesByWeekday[i].size || 1));

  return { byHour, byWeekday, avgByHour, avgByWeekday, totalDays };
}

function simplifyPlatform(p) {
  const s = p.toLowerCase();
  if (s.includes('android')) return 'Android';
  if (s.includes('ios') || s.includes('iphone') || s.includes('ipad')) return 'iOS';
  if (s.includes('osx') || s.includes('os x') || s.includes('mac')) return 'macOS';
  if (s.includes('windows')) return 'Windows';
  if (s.includes('linux')) return 'Linux';
  if (s.includes('partner') || s.includes('cast') || s.includes('sonos') || s.includes('chromecast')) return 'Cast / Speaker';
  if (s.includes('web_player') || s.includes('webplayer') || s.includes('web player')) return 'Web Player';
  return p.split(';')[0].slice(0, 30);
}

import { i18n, LOCALE_MAP } from '../i18n';

function currentLocale() {
  return LOCALE_MAP[i18n.global.locale.value] || 'en-US';
}

function unit(key) {
  return i18n.global.t(`duration.${key}`);
}

export function formatDuration(ms) {
  const d = unit('day');
  const h = unit('hour');
  const m = unit('minute');
  const s = unit('second');
  if (!ms || ms < 0) return `0${s}`;
  if (ms < 60000) {
    const seconds = Math.max(1, Math.round(ms / 1000));
    return `${seconds}${s}`;
  }
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}${d} ${hours}${h} ${minutes}${m}`;
  if (hours > 0) return `${hours}${h} ${minutes}${m}`;
  return `${minutes}${m}`;
}

export function formatShortDuration(ms) {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export function formatNumber(n) {
  return n.toLocaleString(currentLocale());
}

export function formatDate(d) {
  if (!d) return '';
  return d.toLocaleDateString(currentLocale(), { year: 'numeric', month: 'long', day: 'numeric' });
}
