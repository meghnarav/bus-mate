import * as admin from 'firebase-admin';

// Initialize Firebase Admin (Ensure GOOGLE_APPLICATION_CREDENTIALS is set in env)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } catch (error) {
    console.warn('Firebase Admin initialization failed. Push notifications will be disabled.');
  }
}

export class NotificationService {
  /**
   * Sends a push notification to a specific user via their FCM device token.
   */
  async sendPushNotification(
    deviceToken: string,
    title: string,
    body: string,
    dataPayload?: Record<string, string>
  ): Promise<boolean> {
    try {
      const message = {
        notification: {
          title,
          body,
        },
        data: dataPayload,
        token: deviceToken,
      };

      const response = await admin.messaging().send(message);
      console.log('Successfully sent push notification:', response);
      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  /**
   * Sends a broadcast message to a specific topic (e.g., 'route_123_updates')
   */
  async broadcastToTopic(
    topic: string,
    title: string,
    body: string,
    dataPayload?: Record<string, string>
  ): Promise<boolean> {
    try {
      const message = {
        notification: {
          title,
          body,
        },
        data: dataPayload,
        topic,
      };

      const response = await admin.messaging().send(message);
      console.log(`Successfully broadcasted to topic ${topic}:`, response);
      return true;
    } catch (error) {
      console.error(`Error broadcasting to topic ${topic}:`, error);
      return false;
    }
  }
}
