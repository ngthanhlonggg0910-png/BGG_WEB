import {
  Body,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import type { ITechnicalDepartmentService } from '../../application/interfaces/technical-department.service.interface.js';
import {
  layThongTinGiayDeNghiTheoBarcodeMau_RequestDTO,
  layTrangThaiTheoBarcodeMau_RequestDTO,
} from '../../application/dtos/technical-department/technical-department-request.dto.js';
import {
  layThongTinGiayDeNghiTheoBarcodeMau_ResponseDTO,
  layTrangThaiTheoBarcodeMau_ResponseDTO,
  layDanhSachFileTaiLieuTheoBarcodeMau_ResponseDTO,
} from '../../application/dtos/technical-department/technical-department-response.dto.js';

import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

/** Thư mục dùng chung trên máy chủ file, nơi phần mềm Phiếu điều tiết lưu tài liệu kỹ thuật. */
const DEFAULT_TECHNICAL_DOCUMENT_FOLDER = String.raw`\\192.168.1.5\uploads\PhieuDieuTiet\Uploads\TaiLieuKyThuat`;

/**
 * Thư mục tài liệu kỹ thuật: mặc định là thư mục dùng chung ở trên; có thể đổi
 * theo từng máy bằng TECHNICAL_DOCUMENT_FOLDER_PATH trong BGG_BE/.env.
 */
function technicalDocumentFolder(): string {
  return (
    process.env.TECHNICAL_DOCUMENT_FOLDER_PATH?.trim() ||
    DEFAULT_TECHNICAL_DOCUMENT_FOLDER
  );
}

@Controller('technical-department')
export class TechnicalDepartmentController {
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

  @Post('TEC_GetTrangThai_ByBarCodeMau')
  layTrangThaiTheoBarcodeMau(
    @Body() dto: layTrangThaiTheoBarcodeMau_RequestDTO,
  ): Promise<layTrangThaiTheoBarcodeMau_ResponseDTO> {
    return this.technicalDepartmentService.layTrangThaiTheoBarcodeMau(dto);
  }

  @Get('files')
  getFiles() {
    const files = fs.readdirSync(technicalDocumentFolder());

    return {
      success: true,
      data: files,
    };
  }

  @Get('files/:fileName')
  getFile(@Param('fileName') fileName: string, @Res() res: Response) {
    const folderPath = technicalDocumentFolder();
    if (
      !fileName ||
      fileName === '.' ||
      fileName === '..' ||
      path.win32.basename(fileName) !== fileName
    ) {
      throw new NotFoundException('Tên file không hợp lệ');
    }

    const filePath = path.win32.join(folderPath, fileName);

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      throw new NotFoundException('Không tìm thấy file');
    }

    res.setHeader('Content-Disposition', 'inline');

    return res.sendFile(filePath);
  }

  @Post('TEC_TaiLieuKyThuat_LayDanhSachFile_TheoBarcodeMau')
  layDanhSachFileTaiLieuTheoBarcodeMau(
    @Body('BarcodeMau') BarcodeMau: string,
  ): Promise<layDanhSachFileTaiLieuTheoBarcodeMau_ResponseDTO> {
    return this.technicalDepartmentService.layDanhSachFileTaiLieuTheoBarcodeMau(
      BarcodeMau,
    );
  }
}
