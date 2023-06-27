import { Test, TestingModule } from '@nestjs/testing';
import { TwofaController } from './twofa.controller';

describe('TwofaController', () => {
  let controller: TwofaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TwofaController],
    }).compile();

    controller = module.get<TwofaController>(TwofaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
