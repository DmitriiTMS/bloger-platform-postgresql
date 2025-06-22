import { IsNotEmpty, IsString } from "class-validator";

export class DeviceIdParamDto {
    @IsString()
    @IsNotEmpty()
    deviceId: string
}