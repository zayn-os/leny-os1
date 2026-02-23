import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

export function usePersistence<T>(
  key: string,
  initialValue: T,
  firestorePath: string,
  transform?: (data: any) => T
): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const isLoaded = useRef(false);

  // Auth Listener & Data Fetching
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(true);

      if (currentUser) {
        // 🟢 LOGGED IN: Fetch from Firestore
        try {
          const docRef = doc(db, 'users', currentUser.uid, 'modules', firestorePath);
          const snapshot = await getDoc(docRef);
          
          if (snapshot.exists()) {
            let fetchedData = snapshot.data();
            if (transform) fetchedData = transform(fetchedData);
            setData(fetchedData as T);
          } else {
            // New user or no data: Reset to initial (clean slate)
            setData(initialValue); 
          }
        } catch (err) {
          console.error(`Error fetching ${firestorePath}:`, err);
          setData(initialValue);
        }
      } else {
        // ⚪ GUEST: Load from LocalStorage
        try {
          const local = localStorage.getItem(key);
          if (local) {
            let parsed = JSON.parse(local);
            if (transform) parsed = transform(parsed);
            setData(parsed as T);
          } else {
            setData(initialValue);
          }
        } catch (err) {
          console.warn(`Error loading local ${key}:`, err);
          setData(initialValue);
        }
      }
      setLoading(false);
      isLoaded.current = true;
    });
    return () => unsubscribe();
  }, [key, firestorePath]); // Removed initialValue and transform to avoid re-runs

  // Save Listener (Debounced)
  useEffect(() => {
    if (!isLoaded.current) return;

    const handler = setTimeout(async () => {
      if (user) {
        // 🟢 SAVE TO FIRESTORE
        try {
           const docRef = doc(db, 'users', user.uid, 'modules', firestorePath);
           await setDoc(docRef, data as any);
        } catch (err) {
           console.error(`Error saving ${firestorePath}:`, err);
        }
      } else {
        // ⚪ SAVE TO LOCALSTORAGE
        localStorage.setItem(key, JSON.stringify(data));
      }
    }, 1000); // 1s debounce

    return () => clearTimeout(handler);
  }, [data, user, key, firestorePath]);

  return [data, setData, loading];
}
