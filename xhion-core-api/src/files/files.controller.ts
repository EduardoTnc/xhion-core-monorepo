import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    Body,
    BadRequestException,
    UseGuards,
    Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation, ApiQuery } from '@nestjs/swagger';
import * as fs from 'fs';

// Helper para crear directorios si no existen
const ensureDir = (dir: string) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Carpeta temporal para uploads
const TEMP_UPLOAD_DIR = './uploads/temp';

@ApiTags('Archivos')
@Controller('files')
export class FilesController {
    @Post('upload')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Subir un archivo (imagen, documento, etc.)' })
    @ApiConsumes('multipart/form-data')
    @ApiQuery({
        name: 'type',
        required: false,
        enum: ['company', 'avatar', 'task', 'project', 'document'],
        description: 'Tipo de archivo para organizar en carpetas',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: (req, file, cb) => {
                    // Primero guardar en carpeta temporal
                    ensureDir(TEMP_UPLOAD_DIR);
                    cb(null, TEMP_UPLOAD_DIR);
                },
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
                },
            }),
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB
            },
            fileFilter: (req, file, cb) => {
                if (!file.originalname.match(/\.(jpg|jpeg|png|gif|ico|svg|webp|bmp|pdf|doc|docx|xls|xlsx|txt)$/i)) {
                    return cb(new BadRequestException('Tipo de archivo no permitido'), false);
                }
                cb(null, true);
            },
        }),
    )
    uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Query('type') queryType: string,
        @Body('type') bodyType: string,
    ) {
        if (!file) {
            throw new BadRequestException('No se ha subido ningún archivo');
        }

        // Obtener tipo de query param o body (query tiene prioridad)
        const type = queryType || bodyType || 'document';
        const validTypes = ['company', 'avatar', 'task', 'project', 'document'];
        const folder = validTypes.includes(type) ? type : 'document';

        // Mover archivo de temp a carpeta final
        const finalDir = `./uploads/${folder}`;
        ensureDir(finalDir);

        const tempPath = file.path;
        const finalPath = join(finalDir, file.filename);

        try {
            fs.renameSync(tempPath, finalPath);
        } catch (error) {
            // Si renameSync falla (diferentes discos), copiar y eliminar
            fs.copyFileSync(tempPath, finalPath);
            fs.unlinkSync(tempPath);
        }

        // Construir URL pública
        const url = `/uploads/${folder}/${file.filename}`;

        return {
            url,
            filename: file.filename,
            originalname: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            type: folder,
        };
    }
}
