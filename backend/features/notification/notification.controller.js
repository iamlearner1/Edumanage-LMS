const NotificationService = require('./notification.service');

class NotificationController {
  static async getNotifications(req, res) {
    try {
      const { notifications, unreadCount } =
        await NotificationService.getUserNotifications(req.user._id);

      res.json({ notifications, unreadCount });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  static async markAsRead(req, res) {
    try {
      await NotificationService.markAsRead(req.params.id, req.user._id);
      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(400).json({ message: error.message });
    }
  }

  static async markAllAsRead(req, res) {
    try {
      await NotificationService.markAllAsRead(req.user._id);
      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = NotificationController;
