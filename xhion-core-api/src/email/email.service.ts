import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SolicitudAcceso } from '@prisma/client';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  /**
   * Inicializar el transporter de nodemailer
   */
  private initializeTransporter() {
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');

    // Si no hay credenciales configuradas, usar modo de desarrollo (no envía emails reales)
    if (!smtpUser || !smtpPass) {
      this.logger.warn('⚠️  Credenciales SMTP no configuradas. Los emails NO se enviarán.');
      this.logger.warn('⚠️  Para habilitar emails, configura SMTP_USER y SMTP_PASS en el archivo .env');
      
      // Crear transporter de prueba que no envía emails
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      });
      return;
    }

    const emailConfig = {
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    };

    this.transporter = nodemailer.createTransport(emailConfig);

    // Verificar la conexión
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('❌ Error al conectar con el servidor SMTP:', error.message);
        this.logger.warn('⚠️  Los emails NO se enviarán hasta que se corrija la configuración');
      } else {
        this.logger.log('✅ Servidor SMTP listo para enviar emails');
      }
    });
  }

  /**
   * Enviar email de confirmación de solicitud recibida
   */
  async sendSolicitudRecibida(solicitud: SolicitudAcceso): Promise<void> {
    const appName = this.configService.get<string>('APP_NAME', 'Xhion Core');
    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:5173');

    const mailOptions = {
      from: `"${appName}" <${this.configService.get<string>('SMTP_FROM')}>`,
      to: solicitud.email,
      subject: `Solicitud de acceso recibida - ${appName}`,
      html: this.getTemplateConfirmacion(solicitud, appName, appUrl),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email de confirmación enviado a: ${solicitud.email}`);
    } catch (error) {
      this.logger.error(`Error al enviar email de confirmación a ${solicitud.email}:`, error);
      // No lanzamos el error para no bloquear la creación de la solicitud
    }
  }

  /**
   * Enviar email de solicitud aprobada con enlace de invitación
   */
  async sendSolicitudAprobada(
    solicitud: SolicitudAcceso & { invitacion?: { token: string; fecha_expiracion: Date } },
    comentario?: string,
  ): Promise<void> {
    const appName = this.configService.get<string>('APP_NAME', 'Xhion Core');
    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:5173');
    const invitacionUrl = `${appUrl}/aceptar-invitacion?token=${solicitud.invitacion?.token}`;

    const mailOptions = {
      from: `"${appName}" <${this.configService.get<string>('SMTP_FROM')}>`,
      to: solicitud.email,
      subject: `¡Solicitud aprobada! - ${appName}`,
      html: this.getTemplateAprobacion(solicitud, invitacionUrl, comentario, appName),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email de aprobación enviado a: ${solicitud.email}`);
    } catch (error) {
      this.logger.error(`Error al enviar email de aprobación a ${solicitud.email}:`, error);
      throw error; // En este caso sí lanzamos el error porque es crítico
    }
  }

  /**
   * Enviar email de solicitud rechazada
   */
  async sendSolicitudRechazada(solicitud: SolicitudAcceso, comentario?: string): Promise<void> {
    const appName = this.configService.get<string>('APP_NAME', 'Xhion Core');
    const supportEmail = this.configService.get<string>('SUPPORT_EMAIL', 'soporte@xhioncore.com');

    const mailOptions = {
      from: `"${appName}" <${this.configService.get<string>('SMTP_FROM')}>`,
      to: solicitud.email,
      subject: `Actualización sobre tu solicitud - ${appName}`,
      html: this.getTemplateRechazo(solicitud, comentario, appName, supportEmail),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email de rechazo enviado a: ${solicitud.email}`);
    } catch (error) {
      this.logger.error(`Error al enviar email de rechazo a ${solicitud.email}:`, error);
      // No lanzamos el error para no bloquear el rechazo
    }
  }

  /**
   * Notificar a administradores sobre nueva solicitud
   */
  async notifyAdminsNewSolicitud(solicitud: SolicitudAcceso, adminEmails: string[]): Promise<void> {
    const appName = this.configService.get<string>('APP_NAME', 'Xhion Core');
    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:5173');
    const adminUrl = `${appUrl}/admin/solicitudes-acceso`;

    const mailOptions = {
      from: `"${appName}" <${this.configService.get<string>('SMTP_FROM')}>`,
      to: adminEmails.join(', '),
      subject: `Nueva solicitud de acceso - ${appName}`,
      html: this.getTemplateNotificacionAdmin(solicitud, adminUrl, appName),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Notificación enviada a ${adminEmails.length} administradores`);
    } catch (error) {
      this.logger.error('Error al notificar a administradores:', error);
      // No lanzamos el error
    }
  }

  /**
   * Template HTML para confirmación de solicitud recibida
   */
  private getTemplateConfirmacion(solicitud: SolicitudAcceso, appName: string, appUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          ul { list-style: none; padding: 0; }
          ul li { padding: 8px 0; padding-left: 25px; position: relative; }
          ul li:before { content: "✓"; position: absolute; left: 0; color: #667eea; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Solicitud Recibida</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${solicitud.nombreCompleto}</strong>,</p>
            
            <p>Hemos recibido tu solicitud de acceso a <strong>${appName}</strong>.</p>
            
            <div class="info-box">
              <h3>📋 Detalles de tu solicitud:</h3>
              <p><strong>Email:</strong> ${solicitud.email}</p>
              ${solicitud.empresa ? `<p><strong>Empresa:</strong> ${solicitud.empresa}</p>` : ''}
              ${solicitud.cargo ? `<p><strong>Cargo:</strong> ${solicitud.cargo}</p>` : ''}
              <p><strong>Fecha de solicitud:</strong> ${new Date(solicitud.fechaCreacion).toLocaleDateString('es-ES')}</p>
            </div>
            
            <h3>¿Qué sigue?</h3>
            <ul>
              <li>Nuestro equipo revisará tu solicitud</li>
              <li>Recibirás una respuesta por email en las próximas 24-48 horas</li>
              <li>Si es aprobada, te enviaremos un enlace de invitación</li>
              <li>Podrás completar tu registro y acceder a la plataforma</li>
            </ul>
            
            <p style="margin-top: 30px;">Gracias por tu interés en unirte a nuestro equipo.</p>
            
            <p>Saludos,<br><strong>Equipo ${appName}</strong></p>
          </div>
          <div class="footer">
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            <p>&copy; ${new Date().getFullYear()} ${appName}. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template HTML para solicitud aprobada
   */
  private getTemplateAprobacion(
    solicitud: SolicitudAcceso,
    invitacionUrl: string,
    comentario: string | undefined,
    appName: string,
  ): string {
    const diasExpiracion = 7;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-icon { font-size: 60px; margin-bottom: 20px; }
          .button { display: inline-block; padding: 15px 40px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .button:hover { background: #059669; }
          .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .comment-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon">🎉</div>
            <h1>¡Solicitud Aprobada!</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${solicitud.nombreCompleto}</strong>,</p>
            
            <p>¡Tenemos excelentes noticias! Tu solicitud de acceso a <strong>${appName}</strong> ha sido <strong>aprobada</strong>.</p>
            
            ${comentario ? `
              <div class="comment-box">
                <h3>💬 Mensaje del equipo:</h3>
                <p>${comentario}</p>
              </div>
            ` : ''}
            
            <p>Para completar tu registro y acceder a la plataforma, haz clic en el siguiente botón:</p>
            
            <div style="text-align: center;">
              <a href="${invitacionUrl}" class="button">
                ✨ Completar Registro
              </a>
            </div>
            
            <div class="warning-box">
              <p><strong>⚠️ Importante:</strong></p>
              <p>Este enlace expira en <strong>${diasExpiracion} días</strong>. Asegúrate de completar tu registro antes de esa fecha.</p>
            </div>
            
            <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #667eea;">${invitacionUrl}</p>
            
            <p style="margin-top: 30px;">¡Bienvenido al equipo!</p>
            
            <p>Saludos,<br><strong>Equipo ${appName}</strong></p>
          </div>
          <div class="footer">
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            <p>&copy; ${new Date().getFullYear()} ${appName}. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template HTML para solicitud rechazada
   */
  private getTemplateRechazo(
    solicitud: SolicitudAcceso,
    comentario: string | undefined,
    appName: string,
    supportEmail: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .comment-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
          .info-box { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Actualización de tu Solicitud</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${solicitud.nombreCompleto}</strong>,</p>
            
            <p>Lamentamos informarte que tu solicitud de acceso a <strong>${appName}</strong> no ha sido aprobada en este momento.</p>
            
            ${comentario ? `
              <div class="comment-box">
                <h3>💬 Mensaje del equipo:</h3>
                <p>${comentario}</p>
              </div>
            ` : ''}
            
            <div class="info-box">
              <p><strong>ℹ️ ¿Tienes preguntas?</strong></p>
              <p>Si deseas más información o tienes alguna consulta, no dudes en contactarnos:</p>
              <p><strong>Email:</strong> <a href="mailto:${supportEmail}">${supportEmail}</a></p>
            </div>
            
            <p>Agradecemos tu interés en <strong>${appName}</strong>.</p>
            
            <p>Saludos,<br><strong>Equipo ${appName}</strong></p>
          </div>
          <div class="footer">
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            <p>&copy; ${new Date().getFullYear()} ${appName}. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template HTML para notificación a administradores
   */
  private getTemplateNotificacionAdmin(
    solicitud: SolicitudAcceso,
    adminUrl: string,
    appName: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Nueva Solicitud de Acceso</h1>
          </div>
          <div class="content">
            <p>Se ha recibido una nueva solicitud de acceso que requiere revisión.</p>
            
            <div class="info-box">
              <h3>👤 Información del Solicitante:</h3>
              <p><strong>Nombre:</strong> ${solicitud.nombreCompleto}</p>
              <p><strong>Email:</strong> ${solicitud.email}</p>
              ${solicitud.telefono ? `<p><strong>Teléfono:</strong> ${solicitud.telefono}</p>` : ''}
              ${solicitud.empresa ? `<p><strong>Empresa:</strong> ${solicitud.empresa}</p>` : ''}
              ${solicitud.cargo ? `<p><strong>Cargo:</strong> ${solicitud.cargo}</p>` : ''}
              ${solicitud.mensaje ? `<p><strong>Mensaje:</strong><br>${solicitud.mensaje}</p>` : ''}
              <p><strong>Fecha:</strong> ${new Date(solicitud.fechaCreacion).toLocaleString('es-ES')}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${adminUrl}" class="button">
                📋 Revisar Solicitud
              </a>
            </div>
            
            <p style="margin-top: 20px; font-size: 12px; color: #666;">
              Puedes aprobar o rechazar esta solicitud desde el panel de administración.
            </p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${appName}. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
