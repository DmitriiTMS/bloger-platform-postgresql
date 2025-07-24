

export type DeviceDBResponse = {
  id: string;
  ip: string;
  title: string;
  lastActiveDate: string; 
  deviceId: string;
};

export class DeviceViewDto {
  ip: string;
  title: string;
  lastActiveDate: string; 
  deviceId: string;

  static mapToView(device: DeviceDBResponse): DeviceViewDto {
    const dto = new DeviceViewDto();
    dto.ip = device.ip;
    dto.title = device.title;
    dto.lastActiveDate = device.lastActiveDate;
    dto.deviceId = device.deviceId;
    return dto;
  }

  static mapArrayToView(devices: any): DeviceViewDto[] {
    return devices.map(device => this.mapToView(device));
  }
}