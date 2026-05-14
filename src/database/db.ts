import * as SQLite from 'expo-sqlite';

import type { Patient, Result } from '../types';

export const db = SQLite.openDatabaseSync('medinote.db');

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

export async function getAllPatients(): Promise<Patient[]> {
  try {
    return await db.getAllAsync<Patient>('SELECT * FROM patients ORDER BY createdAt DESC, id DESC');
  } catch (error) {
    console.error('Failed to load patients', error);
    throw error;
  }
}

export async function getPatientById(id: number): Promise<Patient | null> {
  try {
    return await db.getFirstAsync<Patient>('SELECT * FROM patients WHERE id = ?', [id]);
  } catch (error) {
    console.error(`Failed to load patient with id ${id}`, error);
    throw error;
  }
}

export async function insertPatient(patient: Patient): Promise<number> {
  try {
    const createdAt = patient.createdAt ?? new Date().toISOString();
    const result = await db.runAsync(
      `INSERT INTO patients (firstName, lastName, pesel, birthDate, bloodType, allergies, diseases, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patient.firstName,
        patient.lastName,
        patient.pesel,
        patient.birthDate ?? '',
        patient.bloodType ?? '',
        patient.allergies ?? '',
        patient.diseases ?? '',
        createdAt,
      ],
    );

    return Number(result.lastInsertRowId);
  } catch (error) {
    console.error('Failed to insert patient', error);
    throw error;
  }
}

export async function deletePatient(id: number): Promise<void> {
  try {
    await db.runAsync('DELETE FROM patients WHERE id = ?', [id]);
  } catch (error) {
    console.error(`Failed to delete patient with id ${id}`, error);
    throw error;
  }
}

export async function getResultsByPatient(patientId: number): Promise<Result[]> {
  try {
    return await db.getAllAsync<Result>('SELECT * FROM results WHERE patientId = ? ORDER BY date DESC, id DESC', [patientId]);
  } catch (error) {
    console.error(`Failed to load results for patient ${patientId}`, error);
    throw error;
  }
}

export async function insertResult(result: Result): Promise<number> {
  try {
    const insertResult = await db.runAsync(
      `INSERT INTO results (patientId, date, glucose, systolic, diastolic, cholesterol, weight, height, notes, photoUri)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        result.patientId,
        result.date,
        result.glucose ?? null,
        result.systolic ?? null,
        result.diastolic ?? null,
        result.cholesterol ?? null,
        result.weight ?? null,
        result.height ?? null,
        result.notes ?? '',
        result.photoUri ?? '',
      ],
    );

    return Number(insertResult.lastInsertRowId);
  } catch (error) {
    console.error('Failed to insert result', error);
    throw error;
  }
}