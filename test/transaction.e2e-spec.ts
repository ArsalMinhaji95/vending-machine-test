import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { CustomApplicationSuccessMessages } from '../src/common/constants/application-messages';
import { authorizationString, bearerString } from './data/common.data';
import { transactionAPIData } from './data/transaction.data';

describe('Transaction Controller of Deposit and Reset API (e2e)', () => {
  let app: INestApplication;
  let sellerJwtToken: string;
  let buyerJwtToken: string;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        disableErrorMessages: false,
      }),
    );
    await app.init();

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(transactionAPIData.sellerSignupForTransactionApi);

    const loggedInSeller = await request(app.getHttpServer())
      .put('/auth/login')
      .send(transactionAPIData.sellerLoginForTransactionApi);
    sellerJwtToken = loggedInSeller.body.data;
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(transactionAPIData.buyerSignupForTransactionApi);

    const loggedInBuyer = await request(app.getHttpServer())
      .put('/auth/login')
      .send(transactionAPIData.buyerLoginForTransactionApi);
    buyerJwtToken = loggedInBuyer.body.data;
  });

  it('should buy deposit money as a buyer', async () => {
    const depositResponse = await request(app.getHttpServer())
      .put('/transaction/deposit')
      .set(authorizationString, bearerString + buyerJwtToken)
      .send({
        deposit: 100,
      });
    expect(depositResponse.body.statusCode).toEqual(HttpStatus.ACCEPTED);
    expect(depositResponse.body.message).toEqual(
      CustomApplicationSuccessMessages.USER_DEPOSIT_SUCCESSFULLY,
    );
  });

  it('should return error if seller hit deposit api', async () => {
    const sellerDeniedResponse = await request(app.getHttpServer())
      .put('/transaction/deposit')
      .set(authorizationString, bearerString + sellerJwtToken)
      .send({
        deposit: 100,
      });
    expect(sellerDeniedResponse.body.statusCode).toEqual(HttpStatus.FORBIDDEN);
    expect(sellerDeniedResponse.body.message).toEqual('Forbidden resource');
    expect(sellerDeniedResponse.body.error).toEqual('Forbidden');
  });

  it('should return multiple error if any of the required field is missing', async () => {
    const multipleDeniedResponse = await request(app.getHttpServer())
      .put('/transaction/deposit')
      .set(authorizationString, bearerString + buyerJwtToken)
      .send({});
    expect(multipleDeniedResponse.body.statusCode).toEqual(
      HttpStatus.BAD_REQUEST,
    );
    expect(multipleDeniedResponse.body.message[0]).toEqual(
      'deposit must be a valid enum value',
    );
    expect(multipleDeniedResponse.body.message[1]).toEqual(
      'deposit should not be empty',
    );
    expect(multipleDeniedResponse.body.error).toEqual('Bad Request');
  });

  it('should return error if multiple of 5 is not inserted', async () => {
    const wrongNumberError = await request(app.getHttpServer())
      .put('/transaction/deposit')
      .set(authorizationString, bearerString + buyerJwtToken)
      .send({
        deposit: 43,
      });
    expect(wrongNumberError.body.error).toEqual('Bad Request');
    expect(wrongNumberError.body.statusCode).toEqual(HttpStatus.BAD_REQUEST);
    expect(wrongNumberError.body.message[0]).toEqual(
      'deposit must be a valid enum value',
    );
  });

  it('should reset deposit to 0', async () => {
    const successfullyDeposited = await request(app.getHttpServer())
      .put('/transaction/deposit/reset')
      .set(authorizationString, bearerString + buyerJwtToken);
    expect(successfullyDeposited.body.data).toEqual(null);
    expect(successfullyDeposited.body.statusCode).toEqual(HttpStatus.ACCEPTED);
  });

  it('should return error if seller try to reset deposit', async () => {
    const returnError = await request(app.getHttpServer())
      .put('/transaction/deposit/reset')
      .set(authorizationString, bearerString + sellerJwtToken);
    expect(returnError.body.statusCode).toEqual(HttpStatus.FORBIDDEN);
  });

  afterAll(async () => {
    await request(app.getHttpServer())
      .delete('/user')
      .set(authorizationString, bearerString + buyerJwtToken);
    await request(app.getHttpServer())
      .delete('/user')
      .set(authorizationString, bearerString + sellerJwtToken);
    await app.close();
  });
});
describe('Transaction Controller of Buying products and Reset API (e2e)', () => {
  let app: INestApplication;
  let sellerJwtToken: string;
  let buyerJwtToken: string;
  let productToBuyId: number;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        disableErrorMessages: false,
      }),
    );
    await app.init();

    await request(app.getHttpServer()).post('/auth/signup').send({
      username: 'arsalseller1ForProd',
      password: 'lenovo1230!',
      role: 'seller',
    });

    const loggedInSeller = await request(app.getHttpServer())
      .put('/auth/login')
      .send({
        username: 'arsalseller1ForProd',
        password: 'lenovo1230!',
      });
    sellerJwtToken = loggedInSeller.body.data;
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(transactionAPIData.buyerSignupForTransactionApi);

    const loggedInBuyer = await request(app.getHttpServer())
      .put('/auth/login')
      .send(transactionAPIData.buyerLoginForTransactionApi);
    buyerJwtToken = loggedInBuyer.body.data;
  });

  it('should deposit money as a buyer', async () => {
    const depositResponse = await request(app.getHttpServer())
      .put('/transaction/deposit')
      .set(authorizationString, bearerString + buyerJwtToken)
      .send({
        deposit: 100,
      });
    expect(depositResponse.body.statusCode).toEqual(HttpStatus.ACCEPTED);
    expect(depositResponse.body.message).toEqual(
      CustomApplicationSuccessMessages.USER_DEPOSIT_SUCCESSFULLY,
    );
  });

  it('should add Product deposit as a seller', async () => {
    const productResponse = await request(app.getHttpServer())
      .post('/product')
      .set(authorizationString, bearerString + sellerJwtToken)
      .send({ product_name: 'new product a1', amount_avb: 5, cost: 50 });
    expect(productResponse.body.message).toEqual(
      CustomApplicationSuccessMessages.PRODUCT_ADDED_SUCCESSFULLY,
    );
    expect(productResponse.body.statusCode).toEqual(HttpStatus.OK);
    const data = productResponse.body.data;
    console.log('data', data);
    productToBuyId = data.product_id;
    expect(data.product_name).toEqual('new product a1');
    expect(data.amount_avb).toEqual(5);
    expect(data.cost).toEqual(50);
  });

  it('should return invalid Product exception if buyer wants to buy wrong product', async () => {
    const depositResponse = await request(app.getHttpServer())
      .put('/transaction/buy')
      .set(authorizationString, bearerString + buyerJwtToken)
      .send({
        product_id: 1,
        qty_of_product: 100,
      });
    expect(depositResponse.body.statusCode).toEqual(HttpStatus.BAD_REQUEST);
    expect(depositResponse.body.message).toEqual(
      'Invalid Product id , or product doesnt exist',
    );
  });

  it('should return not enough quantity exception if buyer wants too lots of product', async () => {
    const depositResponse = await request(app.getHttpServer())
      .put('/transaction/buy')
      .set(authorizationString, bearerString + buyerJwtToken)
      .send({
        product_id: productToBuyId,
        qty_of_product: 100,
      });
    expect(depositResponse.body.statusCode).toEqual(HttpStatus.BAD_REQUEST);
    expect(depositResponse.body.message).toEqual(
      'Stock has ended for this product',
    );
  });

  it('should return successfully bought product', async () => {
    const depositResponse = await request(app.getHttpServer())
      .put('/transaction/buy')
      .set(authorizationString, bearerString + buyerJwtToken)
      .send({
        product_id: productToBuyId,
        qty_of_product: 1,
      });
    expect(depositResponse.body.statusCode).toEqual(HttpStatus.ACCEPTED);
    expect(depositResponse.body.message).toEqual(
      CustomApplicationSuccessMessages.PRODUCT_BOUGHT_SUCCESSFULLY,
    );
  });
  it('should return not enough moeny exception if buyer have less money', async () => {
    const depositResponse = await request(app.getHttpServer())
      .put('/transaction/buy')
      .set(authorizationString, bearerString + buyerJwtToken)
      .send({
        product_id: productToBuyId,
        qty_of_product: 1,
      });
    expect(depositResponse.body.statusCode).toEqual(HttpStatus.BAD_REQUEST);
    expect(depositResponse.body.message).toEqual(
      'You dont have enough money to buy to this product',
    );
  });

  afterAll(async () => {
    await request(app.getHttpServer())
      .delete('/user')
      .set(authorizationString, bearerString + buyerJwtToken);
    await request(app.getHttpServer())
      .delete('/user')
      .set(authorizationString, bearerString + sellerJwtToken);
    await app.close();
  });
});
