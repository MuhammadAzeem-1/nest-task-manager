import { HttpException, HttpStatus } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export class PrismaException extends HttpException {
  constructor(error: PrismaClientKnownRequestError) {
    let message: string;
    let status: HttpStatus;

    switch (error.code) {
      case 'P2002':
        message = 'A record with this data already exists';
        status = HttpStatus.CONFLICT;
        break;
      case 'P2025':
        message = 'Record not found';
        status = HttpStatus.NOT_FOUND;
        break;
      case 'P2003':
        message = 'Foreign key constraint failed';
        status = HttpStatus.BAD_REQUEST;
        break;
      case 'P2004':
        message = 'A constraint failed on the database';
        status = HttpStatus.BAD_REQUEST;
        break;
      case 'P2014':
        message =
          'The change you are trying to make would violate the required relation';
        status = HttpStatus.BAD_REQUEST;
        break;
      case 'P2016':
        message = 'Query interpretation error';
        status = HttpStatus.BAD_REQUEST;
        break;
      case 'P2017':
        message = 'The records for relation are not connected';
        status = HttpStatus.BAD_REQUEST;
        break;
      case 'P2018':
        message = 'The required connected records were not found';
        status = HttpStatus.NOT_FOUND;
        break;
      case 'P2021':
        message = 'The table does not exist in the current database';
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        break;
      case 'P2022':
        message = 'The column does not exist in the current database';
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        break;
      default:
        message = 'Database error occurred';
        status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    super(message, status);
  }
}
