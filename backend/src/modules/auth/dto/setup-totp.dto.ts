import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class SetupTotpDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(64)
  accountName: string;
}
