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
  layTrangThaiTheoLoaiVaBarcodeMau_RequestDTO,
  capNhatTrangThai_TEC_BarcodeMau_RequestDTO,
  TEC_KiemMau_Master_KiemTraTonTai_RequestDTO,
  TEC_KiemMau_Detail_Insert_RequestDTO,
  TEC_KiemMau_Detail_Select_RequestDTO,
} from '../../application/dtos/technical-department/technical-department-request.dto.js';
import {
  layThongTinGiayDeNghiTheoBarcodeMau_ResponseDTO,
  layTrangThaiTheoBarcodeMau_ResponseDTO,
  layDanhSachFileTaiLieuTheoBarcodeMau_ResponseDTO,
  layTrangThaiTheoLoaiVaBarcodeMau_ResponseDTO,
  capNhatTrangThai_TEC_BarcodeMau_ResponseDTO,
  layDanhSachLoi_ResponseDTO,
  TEC_KiemMau_Master_KiemTraTonTai_ResponseDTO,
  TEC_KiemMau_Detail_Insert_ResponseDTO,
  TEC_KiemMau_Detail_Select_ResponseDTO,
} from '../../application/dtos/technical-department/technical-department-response.dto.js';

import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('technical-department')
export class TechnicalDepartmentController {
  // private readonly folderPath = String.raw`\\192.168.1.5\uploads\PhieuDieuTiet\Uploads\TaiLieuKyThuat`;
  private readonly folderPath = 'D:\\Uploads\\TaiLieuKyThuat';
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
    const files = fs.readdirSync(this.folderPath);

    return {
      success: true,
      data: files,
    };
  }

  @Get('files/:fileName')
  getFile(@Param('fileName') fileName: string, @Res() res: Response) {
    const folderPath = process.env.TECHNICAL_DOCUMENT_FOLDER_PATH;
    if (!folderPath) {
      throw new InternalServerErrorException('Chưa cấu hình đường dẫn thư mục');
    }
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

  @Post('TEC_GetTrangThai_ByBarcodeMauAndLoai')
  layTrangThaiTheoLoaiVaBarcodeMau(
    @Body() dto: layTrangThaiTheoLoaiVaBarcodeMau_RequestDTO,
  ): Promise<layTrangThaiTheoLoaiVaBarcodeMau_ResponseDTO> {
    return this.technicalDepartmentService.layTrangThaiTheoLoaiVaBarcodeMau(
      dto,
    );
  }

  @Post('TEC_BarcodeMau_UpdateTrangThai_Mobile')
  capNhatTrangThai_TEC_BarcodeMau(
    @Body() dto: capNhatTrangThai_TEC_BarcodeMau_RequestDTO,
  ): Promise<capNhatTrangThai_TEC_BarcodeMau_ResponseDTO> {
    return this.technicalDepartmentService.capNhatTrangThai_TEC_BarcodeMau(dto);
  }

  @Get('TEC_KiemMau_DanhSachLoi')
  layDanhSachLoi(): Promise<layDanhSachLoi_ResponseDTO> {
    return this.technicalDepartmentService.layDanhSachLoi();
  }

  @Post('TEC_KiemMau_Master_KiemTraTonTai')
  TEC_KiemMau_Master_KiemTraTonTai(
    @Body() dto: TEC_KiemMau_Master_KiemTraTonTai_RequestDTO,
  ): Promise<TEC_KiemMau_Master_KiemTraTonTai_ResponseDTO> {
    return this.technicalDepartmentService.TEC_KiemMau_Master_KiemTraTonTai(
      dto,
    );
  }

  @Post('TEC_KiemMau_Detail_Insert')
  TEC_KiemMau_Detail_Insert(
    @Body() dto: TEC_KiemMau_Detail_Insert_RequestDTO,
  ): Promise<TEC_KiemMau_Detail_Insert_ResponseDTO> {
    return this.technicalDepartmentService.TEC_KiemMau_Detail_Insert(dto);
  }

  @Post('TEC_KiemMau_Detail_Select')
  TEC_KiemMau_Detail_Select(
    @Body() dto: TEC_KiemMau_Detail_Select_RequestDTO,
  ): Promise<TEC_KiemMau_Detail_Select_ResponseDTO> {
    return this.technicalDepartmentService.TEC_KiemMau_Detail_Select(dto);
  }
}
