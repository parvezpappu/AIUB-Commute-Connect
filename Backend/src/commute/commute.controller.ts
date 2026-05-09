import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommuteService } from './commute.service';
import { CreateCommuteDto } from './dto/create-commute.dto';
import { UpdateCommuteDto } from './dto/update-commute.dto';

@Controller('commute')
export class CommuteController {
  constructor(private readonly commuteService: CommuteService) {}

  @Post()
  create(@Body() createCommuteDto: CreateCommuteDto) {
    return this.commuteService.create(createCommuteDto);
  }

  @Get()
  findAll() {
    return this.commuteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commuteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommuteDto: UpdateCommuteDto) {
    return this.commuteService.update(+id, updateCommuteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commuteService.remove(+id);
  }
}
