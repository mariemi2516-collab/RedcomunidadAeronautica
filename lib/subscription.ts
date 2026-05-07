// subscription.ts
export type SubscriptionConfig = {
  cbu: string;
  cvu?: string;
  alias?: string;
  titular: string;
  cuit?: string;
  banco?: string;
  monthlyPriceArs?: number;
  yearlyPriceArs?: number;
  whatsappPhone?: string;
  whatsappMessage?: string;
};

export const subscription: SubscriptionConfig = {
  cbu: "0000003100000000000001",
  cvu: "0000003100000000000001",
  alias: "aeroclub.pagos",
  titular: "Red de Comunidad Aeronautica Asociación Civil",
  cuit: "30-12345678-9",
  banco: "Banco Nación",
  monthlyPriceArs: 12000,
  yearlyPriceArs: 120000,
  whatsappPhone: "5491112345678",
  whatsappMessage: "Hola, te envío el comprobante de mi suscripción a Red de Comunidad Aeronautica · Mi Aeroclub.",
};

// Estilos CSS como string para inyectar
const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .subscription-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    padding: 20px;
  }

  .card {
    max-width: 380px;
    width: 100%;
    display: flex;
    flex-direction: column;
    border-radius: 1.5rem;
    background-color: rgba(0, 0, 0, 0.95);
    padding: 1.5rem;
    box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.3);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 25px 40px -12px rgba(0, 0, 0, 0.4);
  }

  .price {
    font-size: 3rem;
    line-height: 1;
    font-weight: 300;
    letter-spacing: -0.025em;
    color: rgba(255, 255, 255, 1);
  }

  .price small {
    font-size: 0.875rem;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.7);
  }

  .period-selector {
    margin: 1rem 0;
    display: flex;
    gap: 0.75rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2rem;
    padding: 0.25rem;
  }

  .period-btn {
    flex: 1;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 2rem;
    background: transparent;
    color: white;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .period-btn.active {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(4px);
  }

  .period-btn:hover:not(.active) {
    background: rgba(255, 255, 255, 0.1);
  }

  .lists {
    margin-top: 1.5rem;
    display: flex;
    flex-direction: column;
    grid-row-gap: 0.75rem;
    row-gap: 0.75rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: rgba(255, 255, 255, 1);
  }

  .list {
    display: flex;
    align-items: center;
  }

  .list svg {
    height: 1rem;
    width: 1rem;
    flex-shrink: 0;
  }

  .list span {
    margin-left: 1rem;
  }

  .action {
    margin-top: 2rem;
    width: 100%;
    border: 2px solid rgba(255, 255, 255, 1);
    border-radius: 9999px;
    background-color: rgba(255, 255, 255, 1);
    padding: 0.75rem 1.5rem;
    text-align: center;
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 600;
    color: rgba(0, 0, 0, 1);
    outline: none;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .action:hover {
    color: rgba(255, 255, 255, 1);
    background-color: transparent;
    transform: scale(0.98);
  }

  /* Modal estilos */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }

  .modal-overlay.active {
    opacity: 1;
    visibility: visible;
  }

  .modal {
    background: white;
    border-radius: 1.5rem;
    max-width: 500px;
    width: 90%;
    padding: 2rem;
    transform: scale(0.9);
    transition: transform 0.3s ease;
  }

  .modal-overlay.active .modal {
    transform: scale(1);
  }

  .modal h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #1a1a2e;
  }

  .payment-info {
    background: #f5f5f5;
    padding: 1rem;
    border-radius: 0.75rem;
    margin: 1rem 0;
    font-size: 0.875rem;
  }

  .payment-info p {
    margin: 0.5rem 0;
    word-break: break-all;
  }

  .payment-info strong {
    color: #667eea;
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .modal-btn {
    flex: 1;
    padding: 0.75rem;
    border: none;
    border-radius: 0.75rem;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  .modal-btn.primary {
    background: #25d366;
    color: white;
  }

  .modal-btn.primary:hover {
    background: #128c7e;
  }

  .modal-btn.secondary {
    background: #e0e0e0;
    color: #333;
  }

  .modal-btn.secondary:hover {
    background: #ccc;
  }

  .toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #4caf50;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 1100;
    transform: translateX(400px);
    transition: transform 0.3s ease;
  }

  .toast.show {
    transform: translateX(0);
  }
`;

class SubscriptionManager {
  private config: SubscriptionConfig;
  private selectedPeriod: 'monthly' | 'yearly' = 'monthly';
  private currentPrice: number = 0;

  constructor(config: SubscriptionConfig) {
    this.config = config;
    this.currentPrice = config.monthlyPriceArs || 0;
    this.init();
  }

  private getPrice(): number {
    return this.selectedPeriod === 'monthly' 
      ? (this.config.monthlyPriceArs || 0)
      : (this.config.yearlyPriceArs || 0);
  }

  private formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  }

  private getWhatsAppLink(): string {
    const price = this.getPrice();
    const period = this.selectedPeriod === 'monthly' ? 'mensual' : 'anual';
    const message = `Hola, te envío el comprobante de mi suscripción ${period} a Red de Comunidad Aeronautica · Mi Aeroclub. Monto: ${this.formatPrice(price)}`;
    const encodedMessage = encodeURIComponent(message);
    const phone = this.config.whatsappPhone || '';
    return `https://wa.me/${phone}?text=${encodedMessage}`;
  }

  private showToast(message: string, isError: boolean = false) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.background = isError ? '#f44336' : '#4caf50';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  private showPaymentModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    const price = this.getPrice();
    const period = this.selectedPeriod === 'monthly' ? 'Mensual' : 'Anual';
    
    modal.innerHTML = `
      <div class="modal">
        <h3>💳 Datos para transferencia</h3>
        <div class="payment-info">
          <p><strong>Banco:</strong> ${this.config.banco || 'No especificado'}</p>
          <p><strong>Titular:</strong> ${this.config.titular}</p>
          <p><strong>CBU:</strong> ${this.config.cbu}</p>
          ${this.config.cvu ? `<p><strong>CVU:</strong> ${this.config.cvu}</p>` : ''}
          ${this.config.alias ? `<p><strong>Alias:</strong> ${this.config.alias}</p>` : ''}
          ${this.config.cuit ? `<p><strong>CUIT:</strong> ${this.config.cuit}</p>` : ''}
        </div>
        <div class="payment-info" style="background: #e8f5e9;">
          <p><strong>Suscripción ${period}:</strong> ${this.formatPrice(price)}</p>
          <p style="font-size: 12px; color: #666;">✅ Realizá la transferencia y hacé clic en "Ya transferí"</p>
        </div>
        <div class="modal-actions">
          <button class="modal-btn secondary" id="close-modal">Cancelar</button>
          <button class="modal-btn primary" id="confirm-payment">💬 Ya transferí (WhatsApp)</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
    
    const closeModal = () => {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    };
    
    modal.querySelector('#close-modal')?.addEventListener('click', closeModal);
    modal.querySelector('#confirm-payment')?.addEventListener('click', () => {
      const whatsappLink = this.getWhatsAppLink();
      window.open(whatsappLink, '_blank');
      this.showToast('📱 Redirigiendo a WhatsApp...');
      closeModal();
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  private createCardHTML(): string {
    const monthlyPrice = this.config.monthlyPriceArs || 0;
    const yearlyPrice = this.config.yearlyPriceArs || 0;
    const displayPrice = this.formatPrice(this.getPrice());
    const periodText = this.selectedPeriod === 'monthly' ? '/mes' : '/año';
    
    return `
      <div class="subscription-wrapper">
        <div class="card">
          <div class="price">
            ${displayPrice}<small>${periodText}</small>
          </div>
          
          ${monthlyPrice && yearlyPrice ? `
            <div class="period-selector">
              <button class="period-btn ${this.selectedPeriod === 'monthly' ? 'active' : ''}" data-period="monthly">
                📆 Mensual
              </button>
              <button class="period-btn ${this.selectedPeriod === 'yearly' ? 'active' : ''}" data-period="yearly">
                🎯 Anual (Ahorrá ${Math.round((1 - yearlyPrice/(monthlyPrice*12)) * 100)}%)
              </button>
            </div>
          ` : ''}
          
          <ul class="lists">
            <li class="list">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path fill="#ffffff" d="M21.5821 5.54289C21.9726 5.93342 21.9726 6.56658 21.5821 6.95711L10.2526 18.2867C9.86452 18.6747 9.23627 18.6775 8.84475 18.293L2.29929 11.8644C1.90527 11.4774 1.89956 10.8443 2.28655 10.4503C2.67354 10.0562 3.30668 10.0505 3.70071 10.4375L9.53911 16.1717L20.1679 5.54289C20.5584 5.15237 21.1916 5.15237 21.5821 5.54289Z" clip-rule="evenodd" fill-rule="evenodd"></path>
              </svg>
              <span>Cargá Licencias, Seguros y Habilitaciones para recibir alertas</span>
            </li>
            <li class="list">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path fill="#ffffff" d="M21.5821 5.54289C21.9726 5.93342 21.9726 6.56658 21.5821 6.95711L10.2526 18.2867C9.86452 18.6747 9.23627 18.6775 8.84475 18.293L2.29929 11.8644C1.90527 11.4774 1.89956 10.8443 2.28655 10.4503C2.67354 10.0562 3.30668 10.0505 3.70071 10.4375L9.53911 16.1717L20.1679 5.54289C20.5584 5.15237 21.1916 5.15237 21.5821 5.54289Z" clip-rule="evenodd" fill-rule="evenodd"></path>
              </svg>
              <span>Gestioná Tu Aeroclub Desde Un Solo Lugar</span>
            </li>
            <li class="list">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path fill="#ffffff" d="M21.5821 5.54289C21.9726 5.93342 21.9726 6.56658 21.5821 6.95711L10.2526 18.2867C9.86452 18.6747 9.23627 18.6775 8.84475 18.293L2.29929 11.8644C1.90527 11.4774 1.89956 10.8443 2.28655 10.4503C2.67354 10.0562 3.30668 10.0505 3.70071 10.4375L9.53911 16.1717L20.1679 5.54289C20.5584 5.15237 21.1916 5.15237 21.5821 5.54289Z" clip-rule="evenodd" fill-rule="evenodd"></path>
              </svg>
              <span>Soporte Analítico</span>
            </li>
          </ul>
          
          <button class="action" id="subscribe-btn">
            Comienza Hoy
          </button>
        </div>
      </div>
    `;
  }

  private attachEventListeners() {
    // Botón de suscripción
    const subscribeBtn = document.querySelector('#subscribe-btn');
    subscribeBtn?.addEventListener('click', () => {
      this.showPaymentModal();
    });
    
    // Selectores de período
    const periodBtns = document.querySelectorAll('.period-btn');
    periodBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const period = (e.target as HTMLElement).getAttribute('data-period');
        if (period === 'monthly') {
          this.selectedPeriod = 'monthly';
        } else if (period === 'yearly') {
          this.selectedPeriod = 'yearly';
        }
        this.render();
      });
    });
  }

  private render() {
    const existingContainer = document.querySelector('#subscription-root');
    if (existingContainer) {
      existingContainer.innerHTML = this.createCardHTML();
      this.attachEventListeners();
    }
  }

  public init() {
    // Crear contenedor si no existe
    let container = document.querySelector('#subscription-root');
    if (!container) {
      container = document.createElement('div');
      container.id = 'subscription-root';
      document.body.appendChild(container);
    }
    
    // Inyectar estilos
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    
    this.render();
  }
}

// Inicializar automáticamente cuando el DOM esté listo
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const manager = new SubscriptionManager(subscription);
    manager.init();
  });
}

// Exportar para uso en otros módulos
export { SubscriptionManager };