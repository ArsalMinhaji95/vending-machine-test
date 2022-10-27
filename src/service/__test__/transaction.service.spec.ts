import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from '../transaction.service';
import { tableProvider } from '../table.providers';

describe('TransactionService', () => {
  let service: TransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [...tableProvider, TransactionService],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return minimum number of coins in change ', async () => {
    expect(await service.convertChangeIntoCoins(100)).toEqual([100]);
  });
  it('should return minimum number of coins in change ', async () => {
    expect(await service.convertChangeIntoCoins(5)).toEqual([5]);
  });

  it('should return minimum number having four different of coins in change ', async () => {
    expect(await service.convertChangeIntoCoins(275)).toEqual([
      100, 100, 50, 20, 5,
    ]);
  });
  it('should return minimum number having five different of coins in change ', async () => {
    expect(await service.convertChangeIntoCoins(285)).toEqual([
      100, 100, 50, 20, 10, 5,
    ]);
  });

  it('should return minimum number of coins in change ', async () => {
    expect(await service.convertChangeIntoCoins(255)).toEqual([
      100, 100, 50, 5,
    ]);
  });

  it('should return empty array when incorrect change value given ', async () => {
    expect(await service.convertChangeIntoCoins(101)).toEqual([]);
  });

  it('should return empty array when incorrect 0 change value given ', async () => {
    expect(await service.convertChangeIntoCoins(0)).toEqual([]);
  });
});
