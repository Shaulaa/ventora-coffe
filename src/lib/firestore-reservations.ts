import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

export type ReservationStatus =
  | "menunggu"
  | "dikonfirmasi"
  | "ditolak"
  | "selesai"
  | "dibatalkan";

export type Reservation = {
  id: string;
  userId: string;
  name: string;
  phone: string;
  date: string; // format YYYY-MM-DD
  time: string; // format HH:mm
  guestCount: number;
  note?: string;
  status: ReservationStatus;
  createdAt: Date;
  updatedAt?: Date;
};

const reservationsCollection = collection(db, "reservations");

// Ubah dokumen Firestore jadi objek Reservation.
// Spread dulu, baru timpa id dengan document ID asli Firestore, biar field
// "id" di dalam dokumen (kalau ada) gak nimpa ID asli.
function mapReservation(
  snap: { id: string; data: () => Record<string, unknown> }
): Reservation {
  const data = snap.data();
  const toDate = (v: unknown): Date | undefined => {
    if (!v) return undefined;
    if (typeof (v as { toDate?: () => Date }).toDate === "function") {
      return (v as { toDate: () => Date }).toDate();
    }
    if (typeof v === "string") return new Date(v);
    return undefined;
  };
  return {
    ...(data as object),
    id: snap.id,
    createdAt: toDate(data.createdAt) || new Date(),
    updatedAt: toDate(data.updatedAt),
  } as Reservation;
}

/**
 * Ambil semua reservasi user (sekali ambil, bukan real-time).
 * Sengaja tanpa orderBy biar gak butuh composite index, sorting di JS.
 */
export async function getReservationsByUser(
  userId: string
): Promise<Reservation[]> {
  try {
    const q = query(reservationsCollection, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapReservation).sort(sortByDateTimeDesc);
  } catch (error) {
    console.error("Error getting reservations:", error);
    return [];
  }
}

/**
 * Ambil semua reservasi (untuk admin, sekali ambil).
 */
export async function getAllReservations(): Promise<Reservation[]> {
  try {
    const snapshot = await getDocs(reservationsCollection);
    return snapshot.docs.map(mapReservation).sort(sortByDateTimeDesc);
  } catch (error) {
    console.error("Error getting all reservations:", error);
    return [];
  }
}

/**
 * Subscribe real-time reservasi milik satu user.
 * Tanpa orderBy (hindari composite index) — sorting dilakukan di JS.
 */
export function subscribeUserReservations(
  userId: string,
  callback: (reservations: Reservation[]) => void
): () => void {
  const q = query(reservationsCollection, where("userId", "==", userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map(mapReservation).sort(sortByDateTimeDesc);
      callback(data);
    },
    (error) => {
      console.error("Error subscribe user reservations:", error);
      callback([]);
    }
  );
}

/**
 * Subscribe real-time SEMUA reservasi (untuk admin).
 */
export function subscribeAllReservations(
  callback: (reservations: Reservation[]) => void
): () => void {
  return onSnapshot(
    reservationsCollection,
    (snapshot) => {
      const data = snapshot.docs.map(mapReservation).sort(sortByDateTimeDesc);
      callback(data);
    },
    (error) => {
      console.error("Error subscribe all reservations:", error);
      callback([]);
    }
  );
}

/**
 * Buat reservasi baru. Field id/createdAt/updatedAt di-generate server.
 */
export async function createReservation(
  data: Omit<Reservation, "id" | "createdAt" | "updatedAt" | "status"> & {
    status?: ReservationStatus;
  }
): Promise<string | null> {
  try {
    const timestamp = serverTimestamp();
    const docRef = await addDoc(reservationsCollection, {
      ...data,
      status: data.status ?? "menunggu",
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating reservation:", error);
    return null;
  }
}

/**
 * Update status reservasi (dipakai admin & user buat batalin).
 */
export async function updateReservationStatus(
  id: string,
  status: ReservationStatus
): Promise<boolean> {
  try {
    await updateDoc(doc(db, "reservations", id), {
      status,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error(`Error updating reservation ${id}:`, error);
    return false;
  }
}

/** Batalkan reservasi (oleh user). */
export function cancelReservation(id: string): Promise<boolean> {
  return updateReservationStatus(id, "dibatalkan");
}

/** Konfirmasi reservasi (oleh admin). */
export function confirmReservation(id: string): Promise<boolean> {
  return updateReservationStatus(id, "dikonfirmasi");
}

/**
 * Cek ketersediaan slot waktu tertentu.
 */
export async function checkAvailability(
  date: string,
  time: string,
  maxGuestsPerSlot = 10
): Promise<boolean> {
  try {
    const q = query(
      reservationsCollection,
      where("date", "==", date),
      where("time", "==", time),
      where("status", "in", ["menunggu", "dikonfirmasi"])
    );
    const snapshot = await getDocs(q);
    const totalGuests = snapshot.docs.reduce(
      (sum, d) => sum + ((d.data().guestCount as number) || 0),
      0
    );
    return totalGuests < maxGuestsPerSlot;
  } catch (error) {
    console.error("Error checking availability:", error);
    return true; // Default boleh kalau error, jangan blokir user
  }
}

// Sorting: tanggal + waktu terbaru dulu.
function sortByDateTimeDesc(a: Reservation, b: Reservation): number {
  const aKey = `${a.date} ${a.time}`;
  const bKey = `${b.date} ${b.time}`;
  return bKey.localeCompare(aKey);
}
