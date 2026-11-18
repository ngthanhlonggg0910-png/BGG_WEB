import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import type { ITechnicalDepartmentService } from '../../application/interfaces/technical-department.service.interface.js';
import { layThongTinGiayDeNghiTheoBarcodeMau_RequestDTO } from '../../application/dtos/technical-department/technical-department-request.dto.js';
import { layThongTinGiayDeNghiTheoBarcodeMau_ResponseDTO } from '../../application/dtos/technical-department/technical-department-response.dto.js';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
@Controller('technical-department')
export class TechnicalDepartmentController {
  private readonly folderPath = String.raw`\\192.168.1.5\uploads\PhieuDieuTiet\Uploads\TaiLieuKyThuat`;

  constructor(
    @Inject('ITechnicalDepartmentService')
    private readonly technicalDepartmentService: ITechnicalDepartmentService,
  ) {}

  @Post('TEC_GetGiayDeNghi_ByBarcodeMau')
  layThongTinGiayDeNghiTheoBarcodeMau(
    @Body() dto: layThongTinGiayDeNghiTheoBarcodeMau_RequestDTO,
  ): Promise<layThongTinGiayDeNghiTheoBarcodeMau_ResponseDTO> {
    return this.technicalDepartmentService.layThongTinGiayDeNghiTheoBarcodeMau(
      dto,
    );
  }

  @Get('files')
  getFiles() {
    const files = fs.readdirSync(this.folderPath);

    return {
      success: true,
      data: files,
    };
  }

  @Get('files/:fileName')
  getFile(@Param('fileName') fileName: string, @Res() res: Response) {
    const safeName = path.basename(fileName);

    if (
      safeName !== fileName ||
      !safeName ||
      safeName === '.' ||
      safeName === '..'
    ) {
      throw new NotFoundException('File không hợp lệ');
    }

    const filePath = path.join(this.folderPath, safeName);

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      throw new NotFoundException('Không tìm thấy file');
    }

    return res.sendFile(filePath);
  }
}
