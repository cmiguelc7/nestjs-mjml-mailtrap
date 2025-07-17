import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as mjml2html from 'mjml';
import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 587,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });
  }

    async sendMjmlEmail(to: string, subject: string, mjmlTemplate: string) {
        const { html, errors } = mjml2html(mjmlTemplate);

        if (errors.length > 0) {
        console.error(errors);
        throw new Error('Error al compilar MJML');
        }

        const info = await this.transporter.sendMail({
        from: '"Plataforma Citio" <no-reply@tusitio.com>',
        to,
        subject,
        html,
        });

        console.log('Correo enviado:', info.messageId);
        return info;
    }

    async sendInternalAlert(to: string, payload: {
        nombre_usuario: string,
        folio: string,
        legalNameCompany: string,
        rfc: string,
        showFolio: boolean,
        replacedFolio: string,
        mensaje: string
    }) {
        try {
        const mjmlPath = path.join(process.cwd(), 'src', 'mail', 'templates', 'folio.mjml');
        const mjmlTemplate = fs.readFileSync(mjmlPath, 'utf8');

        // Compilar con Handlebars
        const template = Handlebars.compile(mjmlTemplate);
        const mjmlCompiled = template(payload);

        // Convertir MJML a HTML
        const { html } = mjml2html(mjmlCompiled);

        return this.transporter.sendMail({
            from: 'no-reply@tusitio.com',
            to,
            subject: 'Plataforma Citio - Folios por Cancelar',
            html,
        });

        } catch (error) {
        console.error('Error al enviar el correo:', error);
        throw error;
        }
    }

}
