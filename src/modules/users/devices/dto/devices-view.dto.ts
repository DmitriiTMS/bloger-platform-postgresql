

export type DeviceDBResponse = {
  id: string;
  ip: string;
  title: string;
  lastActiveDate: Date; 
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
    dto.lastActiveDate = device.lastActiveDate.toISOString();
    dto.deviceId = device.deviceId;
    return dto;
  }

  static mapArrayToView(devices: DeviceDBResponse[]): DeviceViewDto[] {
    return devices.map(device => this.mapToView(device));
  }
}