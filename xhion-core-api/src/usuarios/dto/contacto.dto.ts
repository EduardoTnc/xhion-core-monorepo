import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsBoolean, IsOptional, Matches, MaxLength } from 'class-validator';
import { TipoContacto } from '@prisma/client';

/**
 * DTO for creating a new contact entry for a user.
 * Supports international phone numbers with full validation.
 */
export class CreateContactoDto {
    @ApiProperty({
        description: 'Type of contact information',
        enum: TipoContacto,
        example: 'telefono_principal',
    })
    @IsNotEmpty({ message: 'El tipo de contacto es requerido' })
    @IsEnum(TipoContacto, { message: 'El tipo de contacto debe ser uno de: telefono_principal, telefono_secundario, email_personal' })
    tipo: TipoContacto;

    @ApiProperty({
        description: 'Contact value (phone number with country code or email)',
        example: '+51 999 888 777',
        maxLength: 255,
    })
    @IsNotEmpty({ message: 'El valor del contacto es requerido' })
    @IsString({ message: 'El valor del contacto debe ser una cadena de texto' })
    @MaxLength(255, { message: 'El valor del contacto no puede exceder 255 caracteres' })
    valor: string;

    @ApiPropertyOptional({
        description: 'Whether this contact information is private (only visible to the user and admins)',
        example: true,
        default: true,
    })
    @IsOptional()
    @IsBoolean({ message: 'El campo esPrivado debe ser un booleano' })
    esPrivado?: boolean;
}

/**
 * DTO for updating an existing contact entry.
 */
export class UpdateContactoDto {
    @ApiPropertyOptional({
        description: 'Updated contact value',
        example: '+51 999 888 777',
        maxLength: 255,
    })
    @IsOptional()
    @IsString({ message: 'El valor del contacto debe ser una cadena de texto' })
    @MaxLength(255, { message: 'El valor del contacto no puede exceder 255 caracteres' })
    valor?: string;

    @ApiPropertyOptional({
        description: 'Whether this contact information is private',
        example: true,
    })
    @IsOptional()
    @IsBoolean({ message: 'El campo esPrivado debe ser un booleano' })
    esPrivado?: boolean;
}

/**
 * Phone number validation utility.
 * Supports international format: +[country code] [number]
 * 
 * Valid formats:
 * - +51 999888777
 * - +1 (555) 123-4567
 * - +44 20 7946 0958
 * - +57 300 123 4567
 * - +52 55 1234 5678
 * 
 * The regex allows:
 * - Optional + at the start
 * - Country code (1-4 digits)
 * - Main number (can include spaces, dashes, parentheses, dots)
 * - Total length between 7 and 20 digits (excluding formatting)
 */
export const PHONE_REGEX = /^\+?[1-9]\d{0,3}[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{1,5}[\s.-]?\d{1,5}[\s.-]?\d{0,5}$/;

/**
 * Email validation regex (standard RFC 5322 simplified)
 */
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Validate phone number format
 * @param phone - Phone number string to validate
 * @returns true if valid, false otherwise
 */
export function isValidPhoneNumber(phone: string): boolean {
    if (!phone) return false;

    // Remove all formatting characters to count digits
    const digitsOnly = phone.replace(/[^\d]/g, '');

    // Must have between 7 and 15 digits (ITU-T E.164 standard)
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        return false;
    }

    // Check format with regex
    return PHONE_REGEX.test(phone);
}

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns true if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
    if (!email) return false;
    return EMAIL_REGEX.test(email);
}

/**
 * Normalize phone number to E.164 format (optional formatting)
 * @param phone - Phone number to normalize
 * @returns Normalized phone number
 */
export function normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters except + at the start
    const hasPlus = phone.startsWith('+');
    const digitsOnly = phone.replace(/[^\d]/g, '');

    return hasPlus ? `+${digitsOnly}` : digitsOnly;
}

/**
 * Get country code from phone number
 * @param phone - Phone number with country code
 * @returns Country code or null if not found
 */
export function extractCountryCode(phone: string): string | null {
    if (!phone.startsWith('+')) return null;

    const normalized = normalizePhoneNumber(phone);
    // Common country codes are 1-3 digits
    // This is a simple extraction, not a full country code lookup
    const match = normalized.match(/^\+(\d{1,3})/);
    return match ? match[1] : null;
}
