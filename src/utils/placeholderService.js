// Placeholder image service với multiple fallbacks - Images only
export class PlaceholderService {
  static fallbackServices = [
    // Primary - Picsum (reliable và đẹp)
    (width = 400, height = 400, seed = 1) => 
      `https://picsum.photos/${width}/${height}?random=${seed}`,
    
    // Secondary - Lorem Picsum với blur
    (width = 400, height = 400, seed = 1) => 
      `https://picsum.photos/${width}/${height}?blur=1&random=${seed}`,
    
    // Tertiary - Placeholder.pics
    (width = 400, height = 400, seed = 1) => 
      `https://placeholder.pics/${width}x${height}`,
    
    // Local base64 fallback
    () => this.getLocalPlaceholder()
  ];

  static currentServiceIndex = 0;
  static failedServices = new Set();

  static getPlaceholder(width = 400, height = 400, seed = Date.now()) {
    // Nếu tất cả service đã fail, dùng local
    if (this.failedServices.size >= this.fallbackServices.length - 1) {
      return this.getLocalPlaceholder();
    }

    // Thử service hiện tại
    const service = this.fallbackServices[this.currentServiceIndex];
    if (this.failedServices.has(this.currentServiceIndex)) {
      this.nextService();
      return this.getPlaceholder(width, height, seed);
    }

    return service(width, height, seed);
  }

  static markServiceFailed(url) {
    // Xác định service nào fail dựa trên URL
    if (url.includes('picsum.photos') && url.includes('blur')) {
      this.failedServices.add(1);
    } else if (url.includes('picsum.photos')) {
      this.failedServices.add(0);
    } else if (url.includes('placeholder.pics')) {
      this.failedServices.add(2);
    }
    
    this.nextService();
  }

  static nextService() {
    this.currentServiceIndex = (this.currentServiceIndex + 1) % this.fallbackServices.length;
  }

  static getLocalPlaceholder() {
    // Safe base64 encoding for SVG with UTF-8 support
    const svgContent = `
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1f2937;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#111827;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="400" fill="url(#grad)" />
        <text x="200" y="180" font-family="Arial, sans-serif" font-size="18" fill="#9ca3af" text-anchor="middle">
          NFT
        </text>
        <text x="200" y="210" font-family="Arial, sans-serif" font-size="14" fill="#6b7280" text-anchor="middle">
          Image Placeholder
        </text>
        <circle cx="200" cy="250" r="30" fill="none" stroke="#ff6b35" stroke-width="2" opacity="0.5">
          <animate attributeName="r" values="25;35;25" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.5;0.8;0.5" dur="2s" repeatCount="indefinite"/>
        </circle>
      </svg>
    `;
    return `data:image/svg+xml;base64,${this.safeBase64Encode(svgContent)}`;
  }

  static getLoadingPlaceholder() {
    const svgContent = `
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="#1f2937" />
        <circle cx="200" cy="200" r="20" fill="none" stroke="#ff6b35" stroke-width="3">
          <animate attributeName="stroke-dasharray" values="0,125.6;62.8,62.8;125.6,0" dur="2s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="rotate" values="0 200 200;360 200 200" dur="2s" repeatCount="indefinite"/>
        </circle>
        <text x="200" y="250" font-family="Arial, sans-serif" font-size="14" fill="#9ca3af" text-anchor="middle">
          Loading...
        </text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${this.safeBase64Encode(svgContent)}`;
  }

  static getErrorPlaceholder() {
    const svgContent = `
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="#1f2937" />
        <circle cx="200" cy="180" r="40" fill="none" stroke="#ef4444" stroke-width="3"/>
        <line x1="180" y1="160" x2="220" y2="200" stroke="#ef4444" stroke-width="3"/>
        <line x1="220" y1="160" x2="180" y2="200" stroke="#ef4444" stroke-width="3"/>
        <text x="200" y="250" font-family="Arial, sans-serif" font-size="16" fill="#ef4444" text-anchor="middle">
          Load Error
        </text>
        <text x="200" y="280" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af" text-anchor="middle">
          Image not available
        </text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${this.safeBase64Encode(svgContent)}`;
  }

  // Safe base64 encoding that handles UTF-8 characters
  static safeBase64Encode(str) {
    try {
      // Use TextEncoder for proper UTF-8 handling
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const binaryString = Array.from(data, byte => String.fromCharCode(byte)).join('');
      return btoa(binaryString);
    } catch (error) {
      console.error('Base64 encoding failed:', error);
      // Fallback: remove non-ASCII characters and encode
      const cleanStr = str.replace(/[^\x00-\x7F]/g, "");
      return btoa(cleanStr);
    }
  }

  // Test connectivity to placeholder services
  static async testServices() {
    const results = [];
    for (let i = 0; i < this.fallbackServices.length - 1; i++) {
      try {
        const url = this.fallbackServices[i](100, 100, 1);
        const response = await fetch(url, { method: 'HEAD', timeout: 5000 });
        results.push({ index: i, url, status: response.status, available: response.ok });
      } catch (error) {
        results.push({ index: i, url: 'failed', status: 0, available: false });
        this.failedServices.add(i);
      }
    }
    return results;
  }
} 