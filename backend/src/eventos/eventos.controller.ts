import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, ValidateNested } from 'class-validator';
import { Repository } from 'typeorm';
import { JwtAuthGuard, Perfis, PerfisGuard } from '../common/auth';
import { RE_DATA, slugify } from '../common/util';
import { Evento, TemaEvento } from '../entities';
import { EventosService } from './eventos.service';

export const UPLOAD_CSV = { limits: { fileSize: 10 * 1024 * 1024 } };

@Controller('eventos')
export class EventosPublicosController {
  constructor(private readonly svc: EventosService) {}

  @Get()
  listar() {
    return this.svc.listarPublico();
  }

  @Get(':slug')
  detalhe(@Param('slug') slug: string) {
    return this.svc.publico(slug);
  }
}

class CriarEventoDto {
  @IsOptional() @IsString() @MaxLength(150) slug?: string;
  @IsString() @IsNotEmpty() @MaxLength(200) nome: string;
  @Matches(RE_DATA) data: string;
  @IsOptional() @IsString() descricao?: string;
  @IsOptional() @IsString() @MaxLength(500) imagemUrl?: string;
}

class ClassificarDto {
  @IsOptional() @IsString() @MaxLength(50) tema: string | null;
}

class LinkDto {
  @IsString() rotulo: string;
  @IsString() rota: string;
}

class AtualizarTemaDto {
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(300) titulo?: string;
  @IsOptional() @IsString() resposta?: string;
  @IsOptional() @IsString() @MaxLength(500) baseOficial?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => LinkDto) links?: LinkDto[];
}

@Controller('admin/eventos')
@UseGuards(JwtAuthGuard, PerfisGuard)
export class EventosAdminController {
  constructor(
    private readonly svc: EventosService,
    @InjectRepository(Evento) private readonly eventos: Repository<Evento>,
    @InjectRepository(TemaEvento) private readonly temas: Repository<TemaEvento>,
  ) {}

  @Get()
  listar() {
    return this.svc.listar();
  }

  @Post()
  @Perfis('gestor')
  async criar(@Body() dto: CriarEventoDto) {
    const slug = slugify(dto.slug || `${dto.nome}-${dto.data.slice(0, 4)}`);
    if (await this.eventos.count({ where: { slug } })) throw new ConflictException('Já existe um evento com este endereço (slug).');
    return this.eventos.save(
      this.eventos.create({
        slug,
        nome: dto.nome,
        data: dto.data,
        descricao: dto.descricao ?? null,
        imagemUrl: dto.imagemUrl ?? null,
        totalInscritos: 0,
        totalPessoas: 0,
      }),
    );
  }

  @Patch('perguntas/:duvidaId')
  classificar(@Param('duvidaId', ParseIntPipe) duvidaId: number, @Body() dto: ClassificarDto) {
    return this.svc.classificar(duvidaId, dto.tema ?? null);
  }

  @Post(':id/importar')
  @Perfis('gestor', 'equipe')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('arquivo', UPLOAD_CSV))
  importar(@Param('id', ParseIntPipe) id: number, @UploadedFile() arquivo?: Express.Multer.File) {
    if (!arquivo?.buffer?.length) throw new BadRequestException('Envie o arquivo CSV no campo "arquivo".');
    return this.svc.importar(id, arquivo.buffer);
  }

  @Get(':id/perguntas')
  perguntas(@Param('id', ParseIntPipe) id: number) {
    return this.svc.perguntas(id);
  }

  @Get(':id/temas')
  listarTemas(@Param('id', ParseIntPipe) id: number) {
    return this.svc.temasComQtd(id);
  }

  @Put(':id/temas/:temaId')
  @Perfis('gestor', 'editor')
  async atualizarTema(
    @Param('id', ParseIntPipe) id: number,
    @Param('temaId', ParseIntPipe) temaId: number,
    @Body() dto: AtualizarTemaDto,
  ) {
    const t = await this.temas.findOne({ where: { id: temaId, eventoId: id } });
    if (!t) throw new BadRequestException('Tema não encontrado neste evento.');
    Object.assign(t, dto, { aprovado: false });
    return this.temas.save(t);
  }

  @Post(':id/temas/aprovar')
  @Perfis('gestor')
  @HttpCode(200)
  async aprovarTemas(@Param('id', ParseIntPipe) id: number) {
    await this.svc.porId(id);
    await this.temas.update({ eventoId: id }, { aprovado: true });
    return this.svc.temasComQtd(id);
  }

  @Post(':id/enviar-respostas')
  @Perfis('gestor', 'equipe')
  @HttpCode(200)
  enviar(@Param('id', ParseIntPipe) id: number) {
    return this.svc.enviarRespostas(id);
  }
}
