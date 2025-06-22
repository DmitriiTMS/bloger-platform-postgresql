import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
} from '@nestjs/common';
import { Request as RequestExpress } from 'express';
import { DevicesService } from './devices.service';
import { DeviceViewDto } from './dto/devices-view.dto';
import { DeviceIdParamDto } from './dto/deviceId-param.dto';


@Controller('security')
export class DevicesController {
  constructor(private devicesService: DevicesService) {}

  @Get('devices')
  @HttpCode(HttpStatus.OK)
  async getAllDevices(@Req() req: RequestExpress): Promise<DeviceViewDto[]> {
    const { refreshToken } = req.cookies;
    const devices = await this.devicesService.getAll(refreshToken);

    return DeviceViewDto.mapArrayToView(devices);
  }

  @Delete('devices')
  @HttpCode(HttpStatus.NO_CONTENT)
  async closeAllSessionsExceptCurrent(@Req() req: RequestExpress) {
    const { refreshToken } = req.cookies;
    return await this.devicesService.closeAllSessionsExceptCurrent(
      refreshToken,
    );
  }

  @Delete('devices/:deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async closeOneSession(
    @Req() req: RequestExpress,
    @Param() params: DeviceIdParamDto,
  ) {
    const { deviceId } = params;
    const { refreshToken } = req.cookies;
    return await this.devicesService.closeOneSession(deviceId, refreshToken);
  }
}