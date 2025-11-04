# 📊 Finance Control - Personal Finance Tracker

A professional, bilingual (English/Spanish) finance tracking web application with cash flow projection, recurring transactions, budget planning, and interactive financial charts.

![Finance Control](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Accessibility](https://img.shields.io/badge/WCAG-AAA-brightgreen.svg)
![Security](https://img.shields.io/badge/security-A+-success.svg)

## 🌟 Features

### Core Functionality
- **📈 Cash Flow Tracking** - Visualize your financial future with interactive charts
- **🔄 Recurring Transactions** - Set up automatic income and expenses (daily, weekly, monthly, etc.)
- **🎯 Goal Setting** - Track progress toward financial targets
- **📅 Calendar View** - See all transactions on an interactive calendar
- **💳 Transaction Management** - Track credit cards, debit cards, cash, and digital wallets
- **📊 Multiple Views** - Balance, Transactions, Events, and Calendar tabs
- **💾 Import/Export** - Excel and JSON support for data portability

### Technical Excellence
- **🌐 Bilingual** - Full English and Spanish support with automatic language detection
- **🎨 Dual Theme** - Light and Dark modes with system preference detection
- **📱 Progressive Web App (PWA)** - Install on any device, works offline
- **♿ WCAG AAA Accessible** - Screen reader support, keyboard navigation, high contrast
- **🔒 Security Hardened** - CSP headers, XSS prevention, input validation
- **🚀 SEO Optimized** - Open Graph tags, structured data, sitemap
- **⚡ Fast Performance** - Optimized rendering, cached resources, service worker

## 🚀 Quick Start

### Live Demo
Visit: [https://samtesura.github.io/Finances/](https://samtesura.github.io/Finances/)

### Local Development
```bash
# Clone the repository
git clone https://github.com/SamTesura/Finances.git
cd Finances

# Open in browser
open index.html
# or use a local server
python -m http.server 8000
# Then visit http://localhost:8000
```

### Install as PWA
1. Visit the website in Chrome/Edge/Safari
2. Click the install icon in the address bar
3. Enjoy native app experience with offline support!

## 📖 How It Works

### Financial Calculations

The app uses Excel-like formulas for accurate financial projections:

**Balance Formula (per period):**
```
Balance = Income - Credit Card - Expenses + Debit Account + Cash
```

**Cumulative Total:**
```
Cumulative = Previous Cumulative + Current Balance
```

### Sections Explained

1. **💸 Income** - Money you receive (salary, freelance, investments)
2. **💳 Credit Card** - Statement charges (calculated by billing cycle)
3. **🧾 Expenses** - Immediate outflows (rent, utilities, groceries)
4. **🏦 Debit Account** - Bank account movements
5. **💵 Cash** - Physical cash on hand

### Timeline Scales

Choose how to view your data:
- Daily - Every single day
- Every 3 days
- Weekly (7 days)
- Bi-weekly (14 days)
- Bi-monthly (15 days)
- Monthly - One column per month

### Recurring Items

Set items to repeat automatically:
- One-time
- Daily
- Every 3 days
- Weekly
- Bi-weekly (every 2 weeks)
- Every 15 days
- Monthly
- Bi-monthly (every 2 months)
- Quarterly (every 3 months)
- Yearly

## 🛡️ Security Features

- **Content Security Policy (CSP)** - Prevents XSS attacks
- **Subresource Integrity (SRI)** - Ensures CDN resources haven't been tampered
- **Input Sanitization** - All user inputs are validated and sanitized
- **No Server** - Data stays on your device (localStorage)
- **HTTPS Required** - GitHub Pages enforces secure connections
- **XSS Prevention** - HTML encoding for all user-generated content

## ♿ Accessibility

This application follows WCAG 2.1 AAA standards:

- ✅ **7:1 Contrast Ratio** - Exceeds AAA requirements
- ✅ **Keyboard Navigation** - Full functionality without mouse
- ✅ **Screen Reader Support** - ARIA labels and semantic HTML
- ✅ **Focus Indicators** - Clear visual focus states
- ✅ **Reduced Motion** - Respects `prefers-reduced-motion`
- ✅ **Touch Targets** - Minimum 44x44px for touch devices
- ✅ **Responsive Design** - Works on all screen sizes

### Keyboard Shortcuts
- `Tab` / `Shift+Tab` - Navigate between elements
- `Enter` - Submit forms, activate buttons
- `Escape` - Close modals
- `Arrow Keys` - Navigate tab panels

## 🌍 SEO Optimization

Following freeCodeCamp best practices:

- ✅ Comprehensive meta tags (title, description, keywords)
- ✅ Open Graph tags for social media
- ✅ Twitter Card tags
- ✅ Structured data (JSON-LD schema)
- ✅ Semantic HTML5
- ✅ Sitemap.xml
- ✅ Robots.txt
- ✅ Canonical URLs
- ✅ Language alternates (hreflang)
- ✅ Mobile-friendly viewport
- ✅ Fast loading times

## 📱 PWA Features

- 📲 **Installable** - Add to home screen on mobile/desktop
- 🔄 **Offline Mode** - Works without internet connection
- 💾 **Service Worker** - Caches resources for fast loading
- 🎯 **App Shortcuts** - Quick actions from app icon
- 🎨 **Splash Screen** - Native app-like experience
- 📊 **Standalone Mode** - Runs in its own window

## 🎨 Design Philosophy

### UX/UI Principles
- **Clarity** - Information hierarchy is immediately clear
- **Efficiency** - Common tasks require minimal clicks
- **Consistency** - Patterns repeat throughout the app
- **Feedback** - All actions provide visual confirmation
- **Error Prevention** - Validation before data loss
- **Responsiveness** - Instant updates, no page reloads

### Visual Design
- **Modern Gradients** - Subtle depth without distraction
- **Smooth Animations** - Polished transitions (respects reduced-motion)
- **Data Visualization** - Charts make trends obvious
- **White Space** - Breathing room prevents overwhelm
- **Typography** - Readable at all sizes

## 🔧 Technology Stack

- **React 18** - UI library
- **Recharts** - Data visualization
- **SheetJS (XLSX)** - Excel import/export
- **Babel Standalone** - JSX compilation in browser
- **Service Worker API** - PWA offline support
- **LocalStorage API** - Client-side data persistence
- **Web App Manifest** - PWA configuration

## 📊 Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Opera | 76+ | ✅ Full |
| Mobile Safari | 14+ | ✅ Full |
| Chrome Android | 90+ | ✅ Full |

## 💾 Data Storage

All data is stored locally in your browser using `localStorage`:

- **Privacy** - Your data never leaves your device
- **No Account** - No sign-up required
- **Persistence** - Data survives browser restarts
- **Portability** - Export to JSON or Excel anytime

### Data Export Formats
- **JSON** - Complete app state (recommended for backup)
- **Excel (XLSX)** - Sections data (for analysis in Excel)
- **Excel (XLSX)** - Transactions (for accounting software)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Test on multiple browsers
- Ensure accessibility compliance
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React** - For the excellent UI library
- **Recharts** - For beautiful charts
- **SheetJS** - For Excel compatibility
- **freeCodeCamp** - For SEO best practices
- **WCAG** - For accessibility guidelines
- **MDN Web Docs** - For comprehensive documentation

## 📞 Support

- **Issues** - [GitHub Issues](https://github.com/SamTesura/Finances/issues)
- **Documentation** - This README and inline comments

## 🗺️ Roadmap

### Upcoming Features
- [ ] Multi-currency support
- [ ] Bank import (OFX, QIF)
- [ ] Budget vs. Actual analysis
- [ ] Custom categories
- [ ] Savings goals tracker
- [ ] Mobile app (React Native)
- [ ] Cloud sync (optional)
- [ ] Bill reminders
- [ ] Financial reports
- [ ] Tax calculations

## 📈 Version History

### v2.0.0 (2025-11-04)
- ✨ Complete UX/UI redesign with PhD-level attention to detail
- 🔒 Enhanced security (CSP, SRI, XSS prevention, input validation)
- ♿ WCAG AAA accessibility compliance
- 🌐 Comprehensive SEO optimization (Open Graph, structured data, sitemap)
- 📱 PWA support with offline mode and service worker
- 🎨 Improved responsive design for all devices
- 🚀 Performance optimizations and better error handling
- 🌍 Bilingual support (English/Spanish) with automatic detection

### v1.0.0 (Initial Release)
- Basic finance tracking
- Excel-like formulas
- Bilingual support
- Chart visualization

---

**Made with ❤️ for better financial planning**

[⬆ Back to top](#-finance-control---personal-finance-tracker)
