import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer">
      <div class="footer-content">
        <div>
          <div class="footer-logo">
            <img src="assets/logo1.png" alt="Materiales JyG">
          </div>
          <p>
            Todo para construcción, remodelación
            y proyectos.
          </p>
        </div>

        <div>
          <h3>Contáctanos</h3>
          <p>📞 248 487 5779</p>
          <p><a href="https://maps.app.goo.gl/TJNw7fUdT1pakQMN7" target="_blank" rel="noopener noreferrer">📍 Carretera Al Verde K2 #31, Santa Catarina Hueyatzacoalco, 74125 San Martín Texmelucan de Labastida, Pue.</a></p>
        </div>

        <div>
          <h3>Redes sociales</h3>
          <a href="https://www.facebook.com/Materialesjyg/" target="_blank">Facebook</a>
          <a href="https://www.instagram.com/materialesjyg/" target="_blank">
            Instagram
          </a>
          <a href="https://www.tiktok.com/@jyg.home" target="_blank">TikTok</a>
          <a href="https://materialesjyg.com/#!" target="_blank" rel="noopener noreferrer">Página web</a>
        </div>
      </div>
    </footer>
  `,
  styles: `:host { display: contents; }`,
})
export class FooterComponent {}
