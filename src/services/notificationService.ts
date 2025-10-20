import { supabase } from '../lib/supabase';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: any;
}

class AdminNotificationService {
  
  // Send push notification to all users
  async sendPushNotification(payload: NotificationPayload) {
    try {
      // This would typically use Firebase Cloud Messaging or similar service
      // For now, we'll log the notification
      console.log('Sending push notification:', payload);
      
      // In a real implementation, you would:
      // 1. Get FCM server key from notification_settings table
      // 2. Send to Firebase Cloud Messaging API
      // 3. Log the notification in notifications_log table
      
      await supabase.from('notifications_log').insert([{
        title: payload.title,
        message: payload.body,
        status: 'sent',
        recipients_count: 0 // Would be actual count in real implementation
      }]);
      
      return { success: true };
    } catch (error) {
      console.error('Failed to send push notification:', error);
      return { success: false, error };
    }
  }

  // Check and send match reminders
  async checkAndSendMatchReminders() {
    try {
      const now = new Date();
      const reminderTime = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now
      
      // Get matches that start in ~15 minutes and haven't had reminder sent
      const { data: matches } = await supabase
        .from('matches')
        .select('*')
        .eq('is_active', true)
        .eq('reminder_sent', false)
        .gte('match_time', now.toISOString())
        .lte('match_time', reminderTime.toISOString());

      if (matches && matches.length > 0) {
        for (const match of matches) {
          await this.sendMatchReminder(match);
          
          // Mark reminder as sent
          await supabase
            .from('matches')
            .update({ reminder_sent: true })
            .eq('id', match.id);
        }
      }
      
      return { success: true, count: matches?.length || 0 };
    } catch (error) {
      console.error('Failed to check match reminders:', error);
      return { success: false, error };
    }
  }

  // Check and send live notifications
  async checkAndSendLiveNotifications() {
    try {
      const now = new Date();
      const liveWindow = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
      
      // Get matches that just started and haven't had live notification sent
      const { data: matches } = await supabase
        .from('matches')
        .select('*')
        .eq('is_active', true)
        .eq('live_notification_sent', false)
        .gte('match_time', liveWindow.toISOString())
        .lte('match_time', now.toISOString());

      if (matches && matches.length > 0) {
        for (const match of matches) {
          await this.sendLiveNotification(match);
          
          // Mark live notification as sent and update status
          await supabase
            .from('matches')
            .update({ 
              live_notification_sent: true,
              status: 'جارية الآن'
            })
            .eq('id', match.id);
        }
      }
      
      return { success: true, count: matches?.length || 0 };
    } catch (error) {
      console.error('Failed to check live notifications:', error);
      return { success: false, error };
    }
  }

  // Send match reminder notification
  private async sendMatchReminder(match: any) {
    const payload: NotificationPayload = {
      title: 'مباراة قريباً! 🏆',
      body: `${match.opponent1_name} VS ${match.opponent2_name} - خلال 15 دقيقة`,
      data: {
        matchId: match.id,
        type: 'reminder'
      }
    };
    
    return await this.sendPushNotification(payload);
  }

  // Send live notification
  private async sendLiveNotification(match: any) {
    const payload: NotificationPayload = {
      title: 'المباراة بدأت! ⚽',
      body: `${match.opponent1_name} VS ${match.opponent2_name} - مباشر الآن`,
      data: {
        matchId: match.id,
        type: 'live'
      }
    };
    
    return await this.sendPushNotification(payload);
  }

  // Auto-update match statuses
  async updateMatchStatuses() {
    try {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      
      // Mark matches as ended if they started more than 2 hours ago
      await supabase
        .from('matches')
        .update({ status: 'انتهت' })
        .eq('is_active', true)
        .neq('status', 'انتهت')
        .lt('match_time', twoHoursAgo.toISOString());
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update match statuses:', error);
      return { success: false, error };
    }
  }

  // Start automatic notification checking (call this on admin panel load)
  startNotificationScheduler() {
    // Check every minute for notifications to send
    setInterval(async () => {
      await this.checkAndSendMatchReminders();
      await this.checkAndSendLiveNotifications();
      await this.updateMatchStatuses();
    }, 60 * 1000); // Every minute
    
    console.log('Notification scheduler started');
  }
}

export const adminNotificationService = new AdminNotificationService();