import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { CustomApplicationSuccessMessages } from '../src/common/constants/application-messages';
import { authAPIData } from './data/auth.data';
import { authorizationString, bearerString } from './data/common.data';

describe('Auth Controller (e2e)', () => {
  let app: INestApplication;

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
  });

  it('should signup user as a buyer', async () => {
    const signupResponse = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(authAPIData.userBuyerSignupData);
    expect(signupResponse.body.statusCode).toEqual(HttpStatus.OK);
    expect(signupResponse.body.message).toEqual(
      CustomApplicationSuccessMessages.USER_SUCCESSFULLY_CREATED,
    );
    expect(signupResponse.body.data).toEqual(null);
  });

  it('should return error when wrong role type given', async () => {
    const errorWrongRole = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(authAPIData.userDataWrongRole);
    expect(errorWrongRole.body.statusCode).toEqual(400);
    expect(errorWrongRole.body.error).toEqual('Bad Request');
    expect(errorWrongRole.body.message[0]).toEqual(
      'role must be a valid enum value',
    );
  });

  it('should return multiple error if any of the required field is missing', async () => {
    const fieldMissingError = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        username: 'arsalmin33',
        role: 'buyer',
      });
    expect(fieldMissingError.body.statusCode).toEqual(400);
    expect(fieldMissingError.body.error).toEqual('Bad Request');
    expect(fieldMissingError.body.message[0]).toEqual(
      'password must be a string',
    );
    expect(fieldMissingError.body.message[1]).toEqual(
      'password should not be empty',
    );
  });
  //
  it('should return error if same username exist', async () => {
    const usernameExistError = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(authAPIData.userBuyerSignupData);
    expect(usernameExistError.body.statusCode).toEqual(410);
    expect(usernameExistError.body.message).toEqual(
      'Username already exist,please select another username',
    );
  });

  it('should signup user as a seller', async () => {
    const successSignupAsSeller = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(authAPIData.userSellerSignupData);
    expect(successSignupAsSeller.body.statusCode).toEqual(HttpStatus.OK);
    expect(successSignupAsSeller.body.message).toEqual(
      CustomApplicationSuccessMessages.USER_SUCCESSFULLY_CREATED,
    );
    expect(successSignupAsSeller.body.data).toEqual(null);
  });
  // //
  it('should login user as a seller', async () => {
    const loggedInSeller = await request(app.getHttpServer())
      .put('/auth/login')
      .send(authAPIData.userSellerLoginData);
    expect(loggedInSeller.body.statusCode).toEqual(HttpStatus.OK);
    expect(loggedInSeller.body.message).toEqual(
      CustomApplicationSuccessMessages.USER_SUCCESSFULLY_LOGGEDIN,
    );
    expect(loggedInSeller.body.data).not.toEqual(null);
  });

  it('should login user as a buyer', async () => {
    const loggedInSeller = await request(app.getHttpServer())
      .put('/auth/login')
      .send(authAPIData.userBuyerLoginData);
    expect(loggedInSeller.body.statusCode).toEqual(HttpStatus.OK);
    expect(loggedInSeller.body.message).toEqual(
      CustomApplicationSuccessMessages.USER_SUCCESSFULLY_LOGGEDIN,
    );
    expect(loggedInSeller.body.data).not.toEqual(null);
  });
  //
  it('should delete user as a seller', async () => {
    const loggedInSeller = await request(app.getHttpServer())
      .put('/auth/login')
      .send(authAPIData.userSellerLoginData);
    const deleteSeller = await request(app.getHttpServer())
      .delete('/user')
      .set(authorizationString, bearerString + loggedInSeller.body.data);
    expect(deleteSeller.body.message).toEqual(
      CustomApplicationSuccessMessages.USER_DELETED_SUCCESSFULLY,
    );
  });
  //
  it('should delete user as a buyer', async () => {
    const loggedInSeller = await request(app.getHttpServer())
      .put('/auth/login')
      .send(authAPIData.userBuyerLoginData);
    const deleteSeller = await request(app.getHttpServer())
      .delete('/user')
      .set(authorizationString, bearerString + loggedInSeller.body.data);
    expect(deleteSeller.body.message).toEqual(
      CustomApplicationSuccessMessages.USER_DELETED_SUCCESSFULLY,
    );
  });

  afterAll(() => {
    app.close();
  });
});
