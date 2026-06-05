import { IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class DisableTotpDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @Length(6, 6)
  code: string;
}
