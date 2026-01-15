# Firebase Setup Guide for Messaging System

Follow these steps to set up your Firebase Firestore database for the messaging system.

## Step 1: Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **scholrpark**
3. In the left sidebar, click on **"Firestore Database"**
4. Click **"Create database"** button
5. Choose **"Start in test mode"** (for development)
6. Select a location (choose the one closest to your users)
7. Click **"Enable"**

## Step 2: Set Up Firestore Security Rules

1. Still in Firestore Database, click on the **"Rules"** tab
2. Replace the existing rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Videos collection (comments subcollection)
    match /videos/{videoId} {
      allow read: if true;
      // Comments subcollection
      match /comments/{commentId} {
        allow read: if true;
        allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
        allow update: if request.auth != null && request.auth.uid == resource.data.userId;
        // Allow delete for the comment owner or an admin user
        allow delete: if request.auth != null && (
          request.auth.uid == resource.data.userId ||
          // read admin flag from users collection for the requesting user
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true
        );
      }
    }

    // Conversations collection
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      allow create: if request.auth != null && 
        request.auth.uid in request.resource.data.participants;
    }

    // Messages subcollection
    match /conversations/{conversationId}/messages/{messageId} {
      allow read: if request.auth != null && 
        request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
      allow create: if request.auth != null && 
        request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
    }

    // Groups collection
    match /groups/{groupId} {
      allow read: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      allow create: if request.auth != null && 
        request.auth.uid in request.resource.data.participants;
      allow update: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }

    // Group messages subcollection
    match /groups/{groupId}/messages/{messageId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in get(/databases/$(database)/documents/groups/$(groupId)).data.participants;
    }
  }
}
```

3. Click **"Publish"** to save the rules

## Step 3: Create Firestore Index (For Conversations)

The user search works without an index (using client-side filtering), but conversations need an index.

### Index 1: For Conversations Query
When you try to load conversations, you'll see an error in the console with a link to create the index automatically. Click that link to create it.

Or manually create:
1. Go to Firestore Database → **"Indexes"** tab
2. Click **"Create Index"**
3. Set:
   - **Collection ID**: `conversations`
   - **Fields to index**:
     - `participants` (Array)
     - `lastMessageAt` (Descending)
   - Query scope: **Collection**
4. Click **"Create"**

**Note:** Index creation takes a few minutes. You'll receive an email when it's ready.

### About User Search
User search uses client-side filtering and doesn't require an index. Just type part of the email or name to find users.

## Step 4: Verify Authentication Methods

Make sure you've already enabled these authentication methods:

1. Go to **Authentication** → **Sign-in method**
2. Enable:
   - ✅ **Email/Password**
   - ✅ **Google** (add `localhost` to authorized domains)

## Step 5: Test the Messaging System

1. Open your app and log in with two different email accounts (use different browsers or incognito mode)
2. In the first account, open the Messages panel
3. Search for the second user by email
4. Click on the user to start a conversation
5. Send messages back and forth
6. You should see real-time message updates!

## Data Structure

Here's how the data is organized in Firestore:

```
users/
  └── {userId}/
      ├── uid: "user123"
      ├── email: "user@example.com"
      ├── displayName: "User Name"
      ├── photoURL: "https://..."
      └── createdAt: Timestamp

conversations/
  └── {conversationId}/
      ├── participants: ["user1", "user2"]
      ├── createdAt: Timestamp
      ├── lastMessage: "Hello!"
      ├── lastMessageAt: Timestamp
      ├── lastMessageBy: "user1"
      └── messages/ (subcollection)
          └── {messageId}/
              ├── senderId: "user1"
              ├── text: "Hello!"
              ├── timestamp: Timestamp
              └── read: false
```

## Troubleshooting

### Error: "Missing or insufficient permissions"
- Check that your Firestore rules are published
- Verify the user is authenticated

### Error: "The query requires an index"
- Click the error link in the console to create the index automatically
- Or manually create the indexes listed above

### Messages not updating in real-time
- Check browser console for errors
- Verify Firestore is enabled in Firebase Console
- Make sure you're logged in

### Users not found in search
- Verify that users have created their account (Firestore user document is created on signup)
- Check that the search query matches the email field
- Note: Search is case-sensitive and matches prefixes only

## Security Notes

⚠️ **Important for Production:**

The test mode rules are permissive. For production, update your Firestore rules to be more strict:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read public profiles
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Videos collection (comments subcollection)
    match /videos/{videoId} {
      allow read: if true;
      match /comments/{commentId} {
        allow read: if true;
        allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
        allow update: if request.auth != null && request.auth.uid == resource.data.userId;
        allow delete: if request.auth != null && (
          request.auth.uid == resource.data.userId ||
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true
        );
      }
    }

    // Only participants can read/write conversations
    match /conversations/{conversationId} {
      allow read: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      allow write: if request.auth != null && 
        request.auth.uid in resource.data.participants;

      // Messages subcollection
      match /messages/{messageId} {
        allow read, write: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
      }
    }
  }
}
```

## Next Steps

Now that messaging is set up, you can:
- ✅ Search and find other users
- ✅ Start one-on-one conversations
- ✅ Send and receive real-time messages
- ✅ Use the AI chat feature
- 💡 Add message notifications
- 💡 Add read receipts
- 💡 Add file/image sharing

