# Soren Larsen Portfolio

Welcome to my portfolio repository! This is a modern, responsive personal website built to showcase my skills, projects, and professional experiences as an AI & Software Systems Engineer. The portfolio features a sophisticated design with dark/light theme support and data-driven content management.

## 🚀 Live Demo

- **Primary URL**: [https://soren-larsen.web.app](https://soren-larsen.web.app)
- **Custom Domain**: [https://www.larsensoren.com](https://www.larsensoren.com)

## 🛠️ Technologies Used

- **React.js**: Modern JavaScript library for building user interfaces
- **Material-UI (MUI)**: Comprehensive React component library with theming support
- **Firebase**: Cloud platform for hosting and deployment
- **React Context API**: State management for theme switching
- **CSS3**: Advanced styling with gradients, animations, and responsive design

## ✨ Key Features

### 🎨 **Modern Design & UX**

- **Dark/Light Theme Toggle**: Seamless theme switching with persistent user preference
- **Responsive Design**: Optimized for all screen sizes (mobile, tablet, desktop)
- **Glassmorphism Effects**: Modern UI with backdrop blur and transparency
- **Smooth Animations**: Engaging transitions and hover effects
- **Professional Color Schemes**: Carefully selected color palettes for both themes

### 📱 **Enhanced Components**

- **Dynamic Navigation**: Responsive navbar that adapts to screen size
- **Interactive Cards**: Expandable sections with detailed information
- **Photo Carousel**: Dynamic image rotation showcasing personal moments
- **Contact Form**: Functional contact form with email integration
- **Skill Visualization**: Professional skill assessment with proficiency levels

### 📊 **Data-Driven Architecture**

- **JSON-Based Content**: All content managed through structured JSON files
- **Centralized Data Management**: Easy content updates without code changes
- **Scalable Structure**: Modular design for easy expansion and maintenance

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── EnhancedAboutCard.js
│   ├── EnhancedContactCard.js
│   ├── EnhancedEducationCard.js
│   ├── EnhancedExperienceCard.js
│   ├── EnhancedProjectCard.js
│   ├── EnhancedSkillCard.js
│   ├── EnhancedCertifications.js
│   └── Navigation.js
├── contexts/             # React Context providers
│   └── ThemeContext.js
├── data/                 # JSON data files
│   ├── about.json
│   ├── certifications.json
│   ├── contact.json
│   ├── education.json
│   ├── experience.json
│   ├── highlights.json
│   ├── projects.json
│   └── skills.json
├── images/               # Static assets
└── theme.js             # Material-UI theme configuration
```

## 🎯 Portfolio Sections

### **About**

- Personal introduction and current role
- Quick highlights with dynamic icons
- Professional headshot carousel
- Data sourced from `highlights.json` and `about.json`

### **Experience**

- Comprehensive professional history
- Company-specific color coding (data-driven)
- Expandable detailed descriptions
- Skills and achievements for each role
- External links to company websites

### **Projects**

- Featured development projects
- Technology stack indicators
- Live demo and GitHub links
- Detailed project descriptions

### **Skills**

- Categorized skill sets (Languages, Frameworks, Tools)
- Proficiency level indicators
- Visual skill assessment
- Data-driven skill management

### **Education**

- Academic background
- Relevant coursework
- Achievements and honors

### **Certifications**

- Professional certifications
- Expandable view with "Show More/Less" functionality
- Certification details and dates

### **Contact**

- Multiple contact methods
- Functional contact form
- Social media links
- Resume download option

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/<your username>/soren-larsen.git
   cd soren-larsen
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to view the portfolio

### Available Scripts

- `npm start`: Runs the app in development mode
- `npm run build`: Builds the app for production
- `npm test`: Launches the test runner
- `npm run eject`: Ejects from Create React App (one-way operation)

## 📝 Content Management

### Updating Content

All portfolio content is managed through JSON files in the `src/data/` directory:

- **Personal Info**: Edit `about.json` and `highlights.json`
- **Work Experience**: Update `experience.json` (includes highlight colors)
- **Projects**: Modify `projects.json`
- **Skills**: Update `skills.json` with proficiency levels
- **Education**: Edit `education.json`
- **Certifications**: Update `certifications.json`
- **Contact Info**: Modify `contact.json`

### Adding New Experience

When adding new work experience, include the `highlightColor` property:

```json
{
  "company": "Company Name",
  "title": "Job Title",
  "highlightColor": {
    "light": "#colorcode",
    "dark": "#colorcode"
  }
}
```

## 🎨 Theming

The portfolio supports comprehensive theming with:

- **Light Mode**: Professional blue and white color scheme
- **Dark Mode**: Modern dark theme with blue accents
- **Persistent Theme**: User preference saved in localStorage
- **Smooth Transitions**: Animated theme switching

## 🚀 Deployment

### Firebase Hosting

The portfolio is deployed using Firebase Hosting:

1. **Build the project**

   ```bash
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

### Firebase Console

- **Project Console**: [Firebase Console](https://console.firebase.google.com/u/0/project/soren-larsen/hosting/sites)

## 🔧 Technical Highlights

- **Performance Optimized**: Lazy loading and code splitting
- **SEO Friendly**: Proper meta tags and semantic HTML
- **Accessibility**: WCAG compliant with proper ARIA labels
- **Cross-Browser Compatible**: Tested across major browsers
- **Mobile-First Design**: Progressive enhancement approach

## 📞 Contact

Feel free to reach out for collaborations or inquiries:

- **Email**: [iamsorenl@gmail.com](mailto:iamsorenl@gmail.com)
- **LinkedIn**: [Soren Larsen](https://www.linkedin.com/in/soren-larsen)
- **GitHub**: [iamsorenl](https://github.com/iamsorenl)

---

_Built by Soren Larsen_
