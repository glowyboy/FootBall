import { supabase } from '../lib/supabase';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: any;
}

class AdminNotificationService {
  
  // Send push notification to all users with simple_push_id
  async sendPushNotification(payload: NotificationPayload) {
    try {
      console.log('Sending push notification:', payload);
      
      // Get all users with FCM tokens (including Expo tokens)
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('fcm_token, simple_push_id, platform')
        .not('fcm_token', 'is', null);

      if (usersError) {
        console.error('❌ Database error:', usersError);
        throw usersError;
      }

      console.log(`📊 Found ${users?.length || 0} users in database`);
      console.log('👥 Users data:', JSON.stringify(users, null, 2));

      const fcmTokens = users?.map(u => u.fcm_token).filter(Boolean) || [];

      console.log(`🎯 Extracted ${fcmTokens.length} valid tokens`);
      console.log('📱 Tokens:', fcmTokens);

      if (fcmTokens.length === 0) {
        alert(`⚠️ No FCM tokens found!\n\nFound ${users?.length || 0} users in database, but none have valid fcm_token.\n\nMake sure users have enabled notifications in the app.`);
        return { success: false, error: 'No FCM tokens' };
      }

      console.log(`📱 Sending notification to ${fcmTokens.length} devices...`);
      console.log('Tokens:', fcmTokens);
      
      // Send via Supabase Edge Function (supports both FCM and Expo tokens)
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/expo-fcm-hybrid`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tokens: fcmTokens,
          notification: {
            title: payload.title,
            body: payload.body
          },
          data: payload.data || {}
        })
      });

      let result;
      if (response.ok) {
        result = await response.json();
        console.log('✅ FCM Response:', result);
      } else {
        console.error('❌ FCM Error:', response.status, response.statusText);
        result = { success: 0, failure: fcmTokens.length };
      }
      
      // Log notification
      await supabase.from('notifications_log').insert([{
        title: payload.title,
        message: payload.body,
        status: response.ok ? 'sent' : 'failed',
        recipients_count: result.success || 0,
        notification_type: payload.data?.type || 'general'
      }]);

      if (response.ok) {
        alert(`✅ Notification sent successfully!\n\n📱 Sent to: ${result.success || 0} devices\n❌ Failed: ${result.failure || 0} devices\n\nTitle: ${payload.title}\nMessage: ${payload.body}`);
      } else {
        alert(`❌ Failed to send notification!\n\nError: ${response.status} ${response.statusText}\n\nMake sure the Edge Function is deployed.`);
      }
      
      return { success: response.ok, recipientsCount: result.success || 0 };
    } catch (error) {
      console.error('Failed to send push notification:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`❌ Failed to send notification: ${errorMessage}`);
      return { success: false, error };
    }
  }

  // Check and send match reminders
  async checkAndSendMatchReminders() {
    try {
      const now = new Date();
      const reminderTime = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now
      
      // Get matches that start in ~15 minutes and haven't had reminder sent
      // Only send if match hasn't started yet
      const { data: matches } = await supabase
        .from('matches')
        .select('*')
        .eq('is_active', true)
        .eq('reminder_sent', false)
        .in('status', ['لم تبدأ بعد', 'Scheduled'])
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
      title: `${match.title || 'مباراة قريباً'} 🏆`,
      body: `${match.opponent1_name} VS ${match.opponent2_name} - خلال 15 دقيقة`,
      data: {
        matchId: match.id,
        type: 'reminder',
        image: match.opponent1_image || match.opponent2_image || '',
        matchTitle: match.title || ''
      }
    };
    
    return await this.sendPushNotification(payload);
  }

  // Send live notification
  private async sendLiveNotification(match: any) {
    const payload: NotificationPayload = {
      title: `${match.title || 'المباراة بدأت'} ⚽`,
      body: `${match.opponent1_name} VS ${match.opponent2_name} - مباشر الآن`,
      data: {
        matchId: match.id,
        type: 'live',
        image: match.opponent1_image || match.opponent2_image || '',
        matchTitle: match.title || ''
      }
    };
    
    return await this.sendPushNotification(payload);
  }

  // Auto-update match statuses and cleanup old notifications
  async updateMatchStatuses() {
    try {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      // Mark matches as ended if they started more than 2 hours ago
      await supabase
        .from('matches')
        .update({ status: 'انتهت' })
        .eq('is_active', true)
        .neq('status', 'انتهت')
        .lt('match_time', twoHoursAgo.toISOString());

      // Cleanup old notifications to prevent database bloat
      await supabase
        .from('user_notifications')
        .delete()
        .lt('created_at', sevenDaysAgo.toISOString());

      // Cleanup old notification logs (keep last 100)
      const { data: oldLogs } = await supabase
        .from('notifications_log')
        .select('id')
        .order('created_at', { ascending: false })
        .range(100, 1000);

      if (oldLogs && oldLogs.length > 0) {
        const oldIds = oldLogs.map(log => log.id);
        await supabase
          .from('notifications_log')
          .delete()
          .in('id', oldIds);
      }

      // Cleanup inactive users (no activity for 30 days) to save space
      await supabase
        .from('users')
        .delete()
        .lt('last_active', thirtyDaysAgo.toISOString());

      console.log('✅ Cleanup completed: old matches, notifications, and inactive users removed');
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update match statuses:', error);
      return { success: false, error };
    }
  }

  // Send test notification manually
  async sendTestNotification() {
    const payload: NotificationPayload = {
      title: '🧪 Test Notification',
      body: 'This is a test notification from the admin panel!',
      data: {
        type: 'test'
      }
    };
    
    return await this.sendPushNotification(payload);
  }

  // Send custom notification
  async sendCustomNotification(title: string, message: string) {
    const payload: NotificationPayload = {
      title: title,
      body: message,
      data: {
        type: 'custom'
      }
    };
    
    return await this.sendPushNotification(payload);
  }

  // Get notification statistics
  async getNotificationStats() {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .not('simple_push_id', 'is', null);

      // Get recent notifications
      const { data: recentNotifications } = await supabase
        .from('notifications_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      return {
        totalUsers: totalUsers || 0,
        recentNotifications: recentNotifications || []
      };
    } catch (error) {
      console.error('Failed to get notification stats:', error);
      return { totalUsers: 0, recentNotifications: [] };
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