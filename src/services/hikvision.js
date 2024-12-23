// src/services/hikvision.js
import axios from 'axios';
import { supabase } from '@/config/supabase';

class HikvisionService {
  constructor() {
    this.controllers = new Map(); // Store controller connections
  }

  async initializeController(controllerConfig) {
    try {
      const { ip_address, port, username, password } = controllerConfig;
      const baseURL = `http://${ip_address}:${port}`;
      
      const controller = axios.create({
        baseURL,
        auth: {
          username,
          password
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Test connection
      await controller.get('/ISAPI/System/status');
      
      this.controllers.set(controllerConfig.id, controller);
      return true;
    } catch (error) {
      console.error('Failed to initialize controller:', error);
      return false;
    }
  }

  async fetchAttendanceRecords(startTime, endTime, controllerId) {
    try {
      const controller = this.controllers.get(controllerId);
      if (!controller) throw new Error('Controller not initialized');

      const response = await controller.post('/ISAPI/AccessControl/AcsEvent/search', {
        searchID: Date.now().toString(),
        timeRange: {
          startTime,
          endTime
        },
        pageNo: 1,
        pageSize: 1000
      });

      return this.processAttendanceRecords(response.data.AcsEvent);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      throw error;
    }
  }

  async grantAccess(controllerId, doorNo, personId) {
    try {
      const controller = this.controllers.get(controllerId);
      if (!controller) throw new Error('Controller not initialized');

      await controller.put(`/ISAPI/AccessControl/RemoteControl/door/${doorNo}`, {
        remoteControlDoor: {
          cmd: "open"
        }
      });

      // Log access event
      await this.logAccessEvent(controllerId, doorNo, personId, 'granted');
      return true;
    } catch (error) {
      console.error('Error granting access:', error);
      throw error;
    }
  }

  async addPerson(controllerId, personInfo) {
    try {
      const controller = this.controllers.get(controllerId);
      if (!controller) throw new Error('Controller not initialized');

      const response = await controller.post('/ISAPI/AccessControl/UserInfo/Record', {
        UserInfo: {
          employeeNo: personInfo.employeeId,
          name: personInfo.name,
          userType: personInfo.userType || "normal",
          Valid: {
            enable: true,
            beginTime: personInfo.beginTime,
            endTime: personInfo.endTime,
          },
          doorRight: personInfo.doorRights
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error adding person:', error);
      throw error;
    }
  }

  async getDeviceStatus(controllerId) {
    try {
      const controller = this.controllers.get(controllerId);
      if (!controller) throw new Error('Controller not initialized');

      const response = await controller.get('/ISAPI/System/status');
      return {
        deviceStatus: response.data.deviceStatus,
        uptimeSeconds: response.data.uptimeSeconds,
        memory: response.data.memory
      };
    } catch (error) {
      console.error('Error getting device status:', error);
      throw error;
    }
  }

  private async logAccessEvent(controllerId, doorNo, personId, status) {
    try {
      await supabase.from('access_logs').insert({
        controller_id: controllerId,
        door_no: doorNo,
        person_id: personId,
        status,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging access event:', error);
    }
  }

  private processAttendanceRecords(records) {
    return records.map(record => ({
      employeeId: record.employeeNo,
      employeeName: record.employeeName,
      checkInTime: record.time,
      deviceId: record.deviceNo,
      doorNo: record.doorNo,
      eventType: record.eventType
    }));
  }
}

export const hikvisionService = new HikvisionService();
