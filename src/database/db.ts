import * as SQLite from 'expo-sqlite';

import type { Patient, Result } from '../types';

// Otwieramy lokalną bazę danych SQLite dla aplikacji Mediq.
export const db = SQLite.openDatabaseSync('mediq.db');

// Tworzymy tabelę pacjentów zgodnie ze schematem offline.
const patientTableSql = `
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    pesel TEXT UNIQUE NOT NULL,
    birthDate TEXT,
    bloodType TEXT,
    allergies TEXT,
    diseases TEXT,
    createdAt TEXT
  );
`;

// Tworzymy tabelę wyników badań powiązaną z pacjentem.
const resultTableSql = `
  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patientId INTEGER NOT NULL,
    date TEXT NOT NULL,
    glucose REAL,
    systolic INTEGER,
    diastolic INTEGER,
    cholesterol REAL,
    weight REAL,
    height REAL,
    notes TEXT,
    photoUri TEXT,
    FOREIGN KEY(patientId) REFERENCES patients(id) ON DELETE CASCADE
  );
`;

// Inicjalizujemy bazę i zakładamy tabele, jeśli jeszcze ich nie ma.
export async function initDB(): Promise<void> {
  try {
    await db.execAsync('PRAGMA foreign_keys = ON;');
    await db.execAsync(patientTableSql);
    await db.execAsync(resultTableSql);
  } catch (error) {
    console.error('Failed to initialize SQLite database', error);
    throw error;
  }
}

// Pobieramy wszystkich pacjentów do listy.
export async function getAllPatients(): Promise<Patient[]> {
  try {
    return await db.getAllAsync<Patient>('SELECT * FROM patients ORDER BY createdAt DESC, id DESC');
  } catch (error) {
    console.error('Failed to load patients', error);
    throw error;
  }
}

// Pobieramy pojedynczego pacjenta po identyfikatorze.
export async function getPatientById(id: number): Promise<Patient | null> {
  try {
    return await db.getFirstAsync<Patient>('SELECT * FROM patients WHERE id = ?', [id]);
  } catch (error) {
    console.error(`Failed to load patient with id ${id}`, error);
    throw error;
  }
}

// Zapisujemy nowego pacjenta i zwracamy jego identyfikator.
export async function insertPatient(pacjent: Patient): Promise<number> {
  try {
    const utworzonoO = pacjent.createdAt ?? new Date().toISOString();
    const wynikZapisu = await db.runAsync(
      `INSERT INTO patients (firstName, lastName, pesel, birthDate, bloodType, allergies, diseases, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pacjent.firstName,
        pacjent.lastName,
        pacjent.pesel,
        pacjent.birthDate ?? '',
        pacjent.bloodType ?? '',
        pacjent.allergies ?? '',
        pacjent.diseases ?? '',
        utworzonoO,
      ],
    );

    return Number(wynikZapisu.lastInsertRowId);
  } catch (error) {
    console.error('Failed to insert patient', error);
    throw error;
  }
}

// Usuwamy pacjenta wraz z jego wynikami.
export async function deletePatient(id: number): Promise<void> {
  try {
    await db.runAsync('DELETE FROM patients WHERE id = ?', [id]);
  } catch (error) {
    console.error(`Failed to delete patient with id ${id}`, error);
    throw error;
  }
}

// Pobieramy wyniki przypisane do konkretnego pacjenta.
export async function getResultsByPatient(patientId: number): Promise<Result[]> {
  try {
    return await db.getAllAsync<Result>('SELECT * FROM results WHERE patientId = ? ORDER BY date DESC, id DESC', [patientId]);
  } catch (error) {
    console.error(`Failed to load results for patient ${patientId}`, error);
    throw error;
  }
}

// Zapisujemy nowy wynik badania i zwracamy jego identyfikator.
export async function insertResult(wynikBadania: Result): Promise<number> {
  try {
    const rezultatZapisu = await db.runAsync(
      `INSERT INTO results (patientId, date, glucose, systolic, diastolic, cholesterol, weight, height, notes, photoUri)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        wynikBadania.patientId,
        wynikBadania.date,
        wynikBadania.glucose ?? null,
        wynikBadania.systolic ?? null,
        wynikBadania.diastolic ?? null,
        wynikBadania.cholesterol ?? null,
        wynikBadania.weight ?? null,
        wynikBadania.height ?? null,
        wynikBadania.notes ?? '',
        wynikBadania.photoUri ?? '',
      ],
    );

    return Number(rezultatZapisu.lastInsertRowId);
  } catch (error) {
    console.error('Failed to insert result', error);
    throw error;
  }
}