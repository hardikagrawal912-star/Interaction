import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { StarItem, NightSession } from '../types';

interface KahaniDB extends DBSchema {
  stars: {
    key: string;
    value: StarItem;
  };
  history: {
    key: string;
    value: NightSession;
  };
  meta: {
    key: string;
    value: unknown;
  };
}

const DB_NAME = 'LightGayiKahaniAayiDB';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<KahaniDB>> | null = null;

function getDb(): Promise<IDBPDatabase<KahaniDB>> {
  if (!dbPromise) {
    dbPromise = openDB<KahaniDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('stars')) {
          db.createObjectStore('stars', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('history')) {
          db.createObjectStore('history', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta');
        }
      },
    });
  }
  return dbPromise;
}

// Starter 10 Stars as specified in prompt
export const STARTER_STARS: Omit<StarItem, 'id' | 'createdAt'>[] = [
  {
    creatorName: 'Dadi',
    relation: 'Dadi',
    type: 'kahani',
    title: 'Mohalle ki Chhat',
    textContent: 'Jab main chhoti thi, har light jaane par poora mohalla chhat par aa jaata tha. Chaarpaaiyan bichh jaati thi aur subah tak batien chalti thi.',
  },
  {
    creatorName: 'Papa',
    relation: 'Papa',
    type: 'sawaal',
    title: 'Yaadgaar Power Cut',
    textContent: 'Aapki zindagi ka sabse yaadgaar power cut kaunsa tha? Kahan the aap aur kya hua tha?',
    targetPerson: 'Sabhi se',
  },
  {
    creatorName: 'Ghar ke Bachche',
    relation: 'Bhai',
    type: 'chunauti',
    title: 'Parchhai ka Jaanwar',
    textContent: 'Andhere mein haath se ek jaanwar ki parchhai banao, baaki log guess karein ki kaun sa jaanwar hai!',
  },
  {
    creatorName: 'Mummy',
    relation: 'Mummy',
    type: 'sawaal',
    title: 'Khandaani Kissa',
    textContent: 'Ghar ka sabse purana kissa kaun sa hai jo humne kabhi nahi suna?',
    targetPerson: 'Bade Buzurg',
  },
  {
    creatorName: 'Behen',
    relation: 'Behen',
    type: 'chunauti',
    title: 'Hasi ki Baat',
    textContent: 'Ek line mein bina hase batao, aaj tumhe kis baat ne sabse zyada hasaya!',
  },
  {
    creatorName: 'Nani',
    relation: 'Nani',
    type: 'kahani',
    title: 'Diye ki Roshni',
    textContent: 'Humare yahan bijli nahi thi toh hum diye ki roshni mein padhte the. Mitti ke tel ki khushboo aaj bhi yaad aati hai.',
  },
  {
    creatorName: 'Bhai',
    relation: 'Bhai',
    type: 'sawaal',
    title: 'Bachpan ka Darr',
    textContent: 'Bachpan ka koi aisa darr jo andhere se juda tha aur ab soch kar hasi aati hai?',
    targetPerson: 'Bhai / Behen',
  },
  {
    creatorName: 'Dost',
    relation: 'Dost',
    type: 'chunauti',
    title: 'Antakshari Twist',
    textContent: 'Ek purana gaana aadhe-aadhe gao, agle bande ko poora karna hai bina ruke!',
  },
  {
    creatorName: 'Dost',
    relation: 'Dost',
    type: 'sawaal',
    title: 'Ghar ki Yaad',
    textContent: 'Tumhari sabse achhi yaad is ghar ki kaunsi hai jise tum hamesha yaad rakhoge?',
    targetPerson: 'Sabhi se',
  },
  {
    creatorName: 'Dada',
    relation: 'Dada',
    type: 'kahani',
    title: 'Taare Ginna',
    textContent: 'Ek baar garmiyon mein poori raat light nahi aayi. Poora parivar aangan mein let kar taare ginte ginte so gaya tha.',
  },
];

export async function getAllStars(): Promise<StarItem[]> {
  const db = await getDb();
  return db.getAll('stars');
}

export async function addStar(star: StarItem): Promise<void> {
  const db = await getDb();
  await db.put('stars', star);
}

export async function deleteStar(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('stars', id);
}

export async function seedStarterStars(force = false): Promise<StarItem[]> {
  const db = await getDb();
  const existing = await db.getAll('stars');
  if (existing.length > 0 && !force) {
    return existing;
  }

  const newStars: StarItem[] = [];
  const baseTimestamp = Date.now();

  for (let i = 0; i < STARTER_STARS.length; i++) {
    const starter = STARTER_STARS[i];
    const ringIndex = (i % 3) + 1; // Rings 1, 2, 3
    const angleRatio = ((i * 137.5) % 360) / 360; // Golden angle dispersion
    const radiusRatio = 0.22 + ringIndex * 0.12;

    const star: StarItem = {
      ...starter,
      id: `star_starter_${i + 1}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: baseTimestamp - (10 - i) * 60000,
      ringIndex,
      angleRatio,
      radiusRatio,
    };
    await db.put('stars', star);
    newStars.push(star);
  }

  return db.getAll('stars');
}

export async function getAllNights(): Promise<NightSession[]> {
  const db = await getDb();
  const nights = await db.getAll('history');
  return nights.sort((a, b) => b.endTime - a.endTime);
}

export async function saveNightSession(session: NightSession): Promise<void> {
  const db = await getDb();
  await db.put('history', session);
}

export async function clearAllData(): Promise<void> {
  const db = await getDb();
  await db.clear('stars');
  await db.clear('history');
  await db.clear('meta');
}

// Convert Blob to Base64 Data URL for JSON export
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Convert Base64 Data URL back to Blob
function base64ToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'audio/webm';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export interface BackupExportData {
  version: 1;
  exportedAt: string;
  appName: string;
  stars: Array<Omit<StarItem, 'audioBlob'> & { audioBase64?: string }>;
  history: NightSession[];
}

export async function exportAllDataAsJson(): Promise<string> {
  const db = await getDb();
  const rawStars = await db.getAll('stars');
  const history = await db.getAll('history');

  const serializableStars = await Promise.all(
    rawStars.map(async (star) => {
      let audioBase64: string | undefined;
      if (star.audioBlob) {
        try {
          audioBase64 = await blobToBase64(star.audioBlob);
        } catch (err) {
          console.warn('Could not export audio blob for star:', star.id, err);
        }
      }
      const { audioBlob: _, ...rest } = star;
      return {
        ...rest,
        audioBase64,
      };
    })
  );

  const backupPayload: BackupExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    appName: 'Light Gayi, Kahani Aayi',
    stars: serializableStars,
    history,
  };

  return JSON.stringify(backupPayload, null, 2);
}

export async function importDataFromJson(jsonString: string): Promise<{ starsCount: number; historyCount: number }> {
  const db = await getDb();
  const parsed = JSON.parse(jsonString) as BackupExportData;

  if (!parsed || !Array.isArray(parsed.stars)) {
    throw new Error('Anyaa! Invalid backup file format.');
  }

  let starsCount = 0;
  for (const s of parsed.stars) {
    let audioBlob: Blob | undefined;
    if (s.audioBase64) {
      audioBlob = base64ToBlob(s.audioBase64);
    }
    const { audioBase64: _, ...rest } = s;
    await db.put('stars', {
      ...rest,
      audioBlob,
    });
    starsCount++;
  }

  let historyCount = 0;
  if (Array.isArray(parsed.history)) {
    for (const h of parsed.history) {
      await db.put('history', h);
      historyCount++;
    }
  }

  return { starsCount, historyCount };
}
