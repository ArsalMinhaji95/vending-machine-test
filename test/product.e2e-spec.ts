import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { CustomApplicationSuccessMessages } from '../src/common/constants/application-messages';
import { authorizationString, bearerString } from './data/common.data';
import { productAPIData } from './data/product.data';

describe('Product Controller as seller (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let productId: number;

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
      .send(productAPIData.sellerSignupForProductApi);
    const loggedInSeller = await request(app.getHttpServer())
      .put('/auth/login')
      .send(productAPIData.sellerLoginForProductApi);
    jwtToken = loggedInSeller.body.data;
  });

  it('should add product as seller', async () => {
    const productResponse = await request(app.getHttpServer())
      .post('/product')
      .set(authorizationString, bearerString + jwtToken)
      .send(productAPIData.productData);
    expect(productResponse.body.message).toEqual(
      CustomApplicationSuccessMessages.PRODUCT_ADDED_SUCCESSFULLY,
    );
    expect(productResponse.body.statusCode).toEqual(HttpStatus.OK);
    const data = productResponse.body.data;
    productId = data.product_id;
    expect(data.product_name).toEqual('new product a1');
    expect(data.amount_avb).toEqual(5);
    expect(data.cost).toEqual(5);
  });

  it('should return multiple error if any of the required field is missing', async () => {
    const multipleFieldMissingError = await request(app.getHttpServer())
      .post('/product')
      .set(authorizationString, bearerString + jwtToken)
      .send(productAPIData.missingProduct);
    expect(multipleFieldMissingError.body.statusCode).toEqual(400);
    expect(multipleFieldMissingError.body.message[0]).toEqual(
      'amount_avb must be a number conforming to the specified constraints',
    );
    expect(multipleFieldMissingError.body.message[1]).toEqual(
      'amount_avb should not be empty',
    );
    expect(multipleFieldMissingError.body.error).toEqual('Bad Request');
  });
  //
  it('should return error cost is not multiple of 5', async () => {
    const errorResponse = await request(app.getHttpServer())
      .post('/product')
      .set(authorizationString, bearerString + jwtToken)
      .send(productAPIData.wrongProductData);
    expect(errorResponse.body.message[0]).toEqual(
      'Cost should be a multiple of 5',
    );
    expect(errorResponse.body.error).toEqual('Bad Request');
    expect(errorResponse.body.statusCode).toEqual(400);
  });
  //
  // it('should successfully update product information as a seller', async () => {
  //   return request(app.getHttpServer()).get('/').expect(404);
  // });
  //
  it('should successfully delete product as a seller', async () => {
    const deleteResponse = await request(app.getHttpServer())
      .delete('/product/' + productId)
      .set(authorizationString, bearerString + jwtToken);
    expect(deleteResponse.body.statusCode).toEqual(HttpStatus.ACCEPTED);
    expect(deleteResponse.body.message).toEqual(
      CustomApplicationSuccessMessages.PRODUCT_REMOVE_SUCCESSFULLY,
    );
  });
  //
  // it('should add multiple products and get all product and delete all products user as a seller', () => {
  //   return request(app.getHttpServer()).get('/').expect(404);
  // });

  afterAll(async () => {
    const deleteSeller = await request(app.getHttpServer())
      .delete('/user')
      .set(authorizationString, bearerString + jwtToken);
    await app.close();
  });
});

describe('Product Controller as buyer (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeEach(async () => {
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
      .send(productAPIData.buyerSignupForProductApi);
    const loggedInSeller = await request(app.getHttpServer())
      .put('/auth/login')
      .send(productAPIData.buyerLoginForProductApi);
    jwtToken = loggedInSeller.body.data;
  });

  it('should return error when product is added by buyer', async () => {
    const forbiddenResponse = await request(app.getHttpServer())
      .post('/product')
      .set(authorizationString, bearerString + jwtToken)
      .send(productAPIData.productData);
    expect(forbiddenResponse.body.statusCode).toEqual(HttpStatus.FORBIDDEN);
    expect(forbiddenResponse.body.message).toEqual('Forbidden resource');
    expect(forbiddenResponse.body.error).toEqual('Forbidden');
  });

  //
  it('should return error when product is deleted by buyer', async () => {
    const forbiddenResponse = await request(app.getHttpServer())
      .delete('/product/' + 2)
      .set(authorizationString, bearerString + jwtToken);

    expect(forbiddenResponse.body.statusCode).toEqual(HttpStatus.FORBIDDEN);
    expect(forbiddenResponse.body.message).toEqual('Forbidden resource');
    expect(forbiddenResponse.body.error).toEqual('Forbidden');
  });

  it('should return error when product is update by buyer', async () => {
    const forbiddenResponse = await request(app.getHttpServer())
      .put('/product/' + 2)
      .send(productAPIData.productData)
      .set(authorizationString, bearerString + jwtToken);
    expect(forbiddenResponse.body.statusCode).toEqual(HttpStatus.FORBIDDEN);
    expect(forbiddenResponse.body.message).toEqual('Forbidden resource');
    expect(forbiddenResponse.body.error).toEqual('Forbidden');
  });
  afterAll(async () => {
    await request(app.getHttpServer())
      .delete('/user')
      .set(authorizationString, bearerString + jwtToken);
    await app.close();
  });
});
