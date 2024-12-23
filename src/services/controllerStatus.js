// src/services/controllerStatus.js
import axios from 'axios';
import { supabase } from '@/config/supabase';

export const controllerStatusService = {
  async checkControllerStatus(controller) {
    try {
      const response = await axios.get(`http://${controller.ip_address}:${controller.port}/ISAPI/System/status`, {
        auth: {
          username: controller.username,
          password: controller.password
        },
        timeout: 5000 // 5 second timeout
      });
      
      if (response.status === 200) {
        await this.updateControllerStatus(controller.id, 'online');
        return true;
      }
      return false;
    } catch (error) {
      await this.updateControllerStatus(controller.id, 'offline');
      return false;
    }
  },

  async updateControllerStatus(controllerId, status) {
    try {
      const { error } = await supabase
        .from('controllers')
        .update({ 
          status,
          last_online: status === 'online' ? new Date().toISOString() : null
        })
        .eq('id', controllerId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating controller status:', error);
    }
  },

  startStatusMonitoring(controllers, interval = 60000) {
    // Check status every minute
    controllers.forEach(controller => {
      setInterval(() => {
        this.checkControllerStatus(controller);
      }, interval);
    });
  }
};
