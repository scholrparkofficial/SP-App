// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, query, orderBy } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDYKhtMkqa9HSEk193JNC5Nuv2Q4rRkbG4",
  authDomain: "scholrpark.firebaseapp.com",
  projectId: "scholrpark",
  storageBucket: "scholrpark.firebasestorage.app",
  messagingSenderId: "686876393628",
  appId: "1:686876393628:web:0ee7dee1cf0d62debb2d59",
  measurementId: "G-DG7HRGDLB6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error(error);
  }
};

export const signupWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error(error);
  }
};

export const loginWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error(error);
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
  }
};

// Firestore helpers for messaging
export const createUserDocument = async (user) => {
  const { doc, setDoc } = await import("firebase/firestore");
  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split("@")[0] || "User",
    photoURL: user.photoURL || "",
    createdAt: new Date(),
  });
  return userRef;
};

// Video helpers: upload to Storage and store metadata in Firestore
export const uploadVideoFile = ({ file, title, description, uploaderId, thumbnailBlob, onProgress } = {}) => {
  // Returns { promise, cancel }
  // promise resolves to { id, videoUrl, thumbnailUrl }
  const ts = Date.now();
  const videoPath = `videos/${ts}_${file.name}`;
  const videoStorageRef = storageRef(storage, videoPath);
  const uploadTask = uploadBytesResumable(videoStorageRef, file);

  const main = (async () => {
    const { collection, addDoc } = await import('firebase/firestore');

    // Track progress
    const uploadPromise = new Promise((resolve, reject) => {
      uploadTask.on('state_changed', (snapshot) => {
        if (onProgress && snapshot.totalBytes) {
          const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          try { onProgress(percent); } catch (e) {}
        }
      }, (err) => reject(err), () => resolve());
    });

    await uploadPromise;
    const videoUrl = await getDownloadURL(videoStorageRef);

    let thumbnailUrl = null;
    if (thumbnailBlob) {
      const thumbPath = `videos/thumbnails/${ts}_${file.name}.jpg`;
      const thumbRef = storageRef(storage, thumbPath);
      await uploadBytesResumable(thumbRef, thumbnailBlob);
      thumbnailUrl = await getDownloadURL(thumbRef);
    }

    // Store metadata in Firestore 'videos' collection
    const videosCol = collection(db, 'videos');
    const { serverTimestamp } = await import('firebase/firestore');
    const docRef = await addDoc(videosCol, {
      title,
      description,
      uploaderId,
      videoUrl,
      thumbnailUrl,
      createdAt: serverTimestamp(),
    });

    return { id: docRef.id, videoUrl, thumbnailUrl };
  })();

  const cancel = () => {
    try {
      if (uploadTask && typeof uploadTask.cancel === 'function') uploadTask.cancel();
    } catch (e) {}
  };

  return { promise: main, cancel };
};

export const getVideos = async (limitCount = 50) => {
  const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
  const videosCol = collection(db, 'videos');
  const q = query(videosCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getVideoById = async (id) => {
  const { doc, getDoc } = await import('firebase/firestore');
  const docRef = doc(db, 'videos', id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

export const searchUsers = async (searchTerm) => {
  const { collection, getDocs } = await import("firebase/firestore");
  const usersRef = collection(db, "users");
  const snapshot = await getDocs(usersRef);
  
  // Client-side filtering to avoid index requirement
  const searchLower = searchTerm.toLowerCase();
  const results = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(user => 
      user.email?.toLowerCase().includes(searchLower) ||
      user.displayName?.toLowerCase().includes(searchLower)
    )
    .slice(0, 10);
  
  return results;
};

export const getUserConversations = async (userId) => {
  const { collection, query, where, getDocs } = await import("firebase/firestore");
  const conversationsRef = collection(db, "conversations");
  // First try with ordering
  try {
    const { orderBy: orderByFn } = await import("firebase/firestore");
    const q = query(conversationsRef, where("participants", "array-contains", userId), orderByFn("lastMessageAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    // If index is not ready, just get conversations without ordering
    const q = query(conversationsRef, where("participants", "array-contains", userId));
    const snapshot = await getDocs(q);
    const conversations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort client-side
    return conversations.sort((a, b) => {
      const aTime = a.lastMessageAt?.toMillis?.() || 0;
      const bTime = b.lastMessageAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
  }
};

export const sendMessage = async (conversationId, senderId, text) => {
  const { collection, doc, addDoc, updateDoc, Timestamp } = await import("firebase/firestore");
  const messagesRef = collection(db, "conversations", conversationId, "messages");
  const messageDoc = await addDoc(messagesRef, {
    senderId,
    text,
    timestamp: Timestamp.now(),
    readBy: [],
    deletedFor: [],
    deletedForEveryone: false,
  });
  
  // Update conversation last message
  const conversationRef = doc(db, "conversations", conversationId);
  await updateDoc(conversationRef, {
    lastMessage: text,
    lastMessageAt: Timestamp.now(),
    lastMessageBy: senderId,
  });

  return messageDoc.id;
};

export const markMessageAsRead = async (conversationId, messageId, userId) => {
  const { doc, updateDoc, arrayUnion } = await import("firebase/firestore");
  const messageRef = doc(db, "conversations", conversationId, "messages", messageId);
  await updateDoc(messageRef, {
    readBy: arrayUnion(userId)
  });
};

export const deleteMessageForMe = async (conversationId, messageId, userId) => {
  const { doc, updateDoc, arrayUnion } = await import("firebase/firestore");
  const messageRef = doc(db, "conversations", conversationId, "messages", messageId);
  await updateDoc(messageRef, {
    deletedFor: arrayUnion(userId)
  });
};

export const deleteMessageForEveryone = async (conversationId, messageId) => {
  const { doc, updateDoc } = await import("firebase/firestore");
  const messageRef = doc(db, "conversations", conversationId, "messages", messageId);
  await updateDoc(messageRef, {
    deletedForEveryone: true,
    text: "This message was deleted"
  });
};

export const getConversationMessages = (conversationId) => {
  const messagesRef = collection(db, "conversations", conversationId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));
  return q;
};

export const createConversation = async (participantIds) => {
  const { collection, addDoc, doc, setDoc } = await import("firebase/firestore");
  const conversationRef = doc(collection(db, "conversations"));
  await setDoc(conversationRef, {
    participants: participantIds,
    createdAt: new Date(),
    lastMessage: "",
    lastMessageAt: new Date(),
    lastMessageBy: null,
  });
  return conversationRef.id;
};

export const getOrCreateConversation = async (currentUserId, otherUserId) => {
  const { collection, query, where, getDocs, doc, setDoc } = await import("firebase/firestore");
  
  // Check if conversation already exists
  const conversationsRef = collection(db, "conversations");
  const q = query(conversationsRef, where("participants", "array-contains", currentUserId));
  const snapshot = await getDocs(q);
  
  const existingConversation = snapshot.docs.find(conv => {
    const data = conv.data();
    return data.participants.includes(otherUserId);
  });
  
  if (existingConversation) {
    return existingConversation.id;
  }
  
  // Create new conversation
  const newConversationRef = doc(conversationsRef);
  await setDoc(newConversationRef, {
    participants: [currentUserId, otherUserId],
    createdAt: new Date(),
    lastMessage: "",
    lastMessageAt: new Date(),
    lastMessageBy: null,
  });
  
  return newConversationRef.id;
};

export const getUserDetails = async (userId) => {
  const { doc, getDoc } = await import("firebase/firestore");
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() };
  }
  return null;
};

// Group chat functions
export const createGroup = async (groupName, createdBy, participantIds) => {
  const { collection, doc, setDoc } = await import("firebase/firestore");
  const groupsRef = collection(db, "groups");
  const newGroupRef = doc(groupsRef);
  
  await setDoc(newGroupRef, {
    name: groupName,
    createdBy,
    participants: participantIds,
    createdAt: new Date(),
    type: "group",
    lastMessage: "",
    lastMessageAt: new Date(),
    lastMessageBy: null,
  });
  
  return newGroupRef.id;
};

export const getGroupsForUser = async (userId) => {
  const { collection, query, where, getDocs } = await import("firebase/firestore");
  const groupsRef = collection(db, "groups");
  const q = query(groupsRef, where("participants", "array-contains", userId));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getGroupDetails = async (groupId) => {
  const { doc, getDoc } = await import("firebase/firestore");
  const groupRef = doc(db, "groups", groupId);
  const groupSnap = await getDoc(groupRef);
  
  if (groupSnap.exists()) {
    return { id: groupSnap.id, ...groupSnap.data() };
  }
  return null;
};

export const getGroupMessages = (groupId) => {
  const messagesRef = collection(db, "groups", groupId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));
  return q;
};

export const sendGroupMessage = async (groupId, senderId, text) => {
  const { collection, doc, addDoc, updateDoc, Timestamp } = await import("firebase/firestore");
  const messagesRef = collection(db, "groups", groupId, "messages");
  
  await addDoc(messagesRef, {
    senderId,
    text,
    timestamp: Timestamp.now(),
    read: [],
    deletedFor: [],
    deletedForEveryone: false,
  });
  
  // Update group last message
  const groupRef = doc(db, "groups", groupId);
  await updateDoc(groupRef, {
    lastMessage: text,
    lastMessageAt: Timestamp.now(),
    lastMessageBy: senderId,
  });
};

export const markGroupMessageAsRead = async (groupId, messageId, userId) => {
  const { doc, updateDoc, arrayUnion } = await import("firebase/firestore");
  const messageRef = doc(db, "groups", groupId, "messages", messageId);
  await updateDoc(messageRef, {
    read: arrayUnion(userId)
  });
};

export const deleteGroupMessageForMe = async (groupId, messageId, userId) => {
  const { doc, updateDoc, arrayUnion } = await import("firebase/firestore");
  const messageRef = doc(db, "groups", groupId, "messages", messageId);
  await updateDoc(messageRef, {
    deletedFor: arrayUnion(userId)
  });
};

export const deleteGroupMessageForEveryone = async (groupId, messageId) => {
  const { doc, updateDoc } = await import("firebase/firestore");
  const messageRef = doc(db, "groups", groupId, "messages", messageId);
  await updateDoc(messageRef, {
    deletedForEveryone: true,
    text: "This message was deleted"
  });
};

export const addMemberToGroup = async (groupId, userIds) => {
  const { doc, updateDoc, arrayUnion } = await import("firebase/firestore");
  const groupRef = doc(db, "groups", groupId);
  
  await updateDoc(groupRef, {
    participants: arrayUnion(...userIds),
  });
};

export const deleteGroup = async (groupId) => {
  const { doc, collection, getDocs, deleteDoc } = await import("firebase/firestore");
  
  // Delete all messages in the group
  const messagesRef = collection(db, "groups", groupId, "messages");
  const messagesSnapshot = await getDocs(messagesRef);
  const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
  
  // Delete the group
  const groupRef = doc(db, "groups", groupId);
  await deleteDoc(groupRef);
};
