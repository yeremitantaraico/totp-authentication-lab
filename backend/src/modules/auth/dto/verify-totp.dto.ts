import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyTotpDto {
  @IsString()
  @IsNotEmpty()
  tempToken: string;

  @IsString()
  @Length(6, 6)
  code: string;
}
