export const person = {
  name: "Eric Onah",
  title: "Full-stack Developer | WordPress | Headless CMS",
  phone: "+2348108769293",
  email: "ericdavid4u@gmail.com",
  linkedin: "https://linkedin.com/in/eric-onah/",
  github: "https://github.com/EricOnah",
  portfolio: "https://ericonah.github.io/portfoliodesign.github.io/",
};

export const summary = {
  headline:
    "WordPress specialist building performant, headless-ready experiences with React and Next.js.",
  body: `Passionate WordPress Web Developer with 5+ years of hands-on experience building and managing scalable WordPress websites, including custom themes, plugins, headless WordPress architectures, and performance optimization. Skilled in both traditional WordPress and Headless CMS workflows using React and Next.js, integrating REST APIs, and building modern, responsive user experiences.`,
  body2: `Strong in troubleshooting complex front-end and back-end issues, optimizing security, improving performance, and managing SEO. Experienced with global remote teams and cross-functional collaboration. Seeking opportunities to contribute deep technical WordPress, React, and headless CMS expertise to drive impactful digital experiences.`,
};

export type ExperienceItem = {
  role: string;
  company: string;
  location?: string;
  period: string;
  bullets: string[];
};

export const experiences: ExperienceItem[] = [
  {
    role: "WordPress Web Developer (Contract)",
    company: "Krisztech Agency",
    location: "Port Harcourt, Nigeria",
    period: "September 2023 – Present",
    bullets: [
      "Developed and customized WordPress websites using custom themes and plugins.",
      "Managed content uploads, SEO structure, and site optimization.",
      "Improved security, fixed performance issues, and handled troubleshooting.",
      "Integrated APIs, payment systems, and third-party services.",
      "Built API-friendly WordPress structures for future Headless CMS use.",
    ],
  },
  {
    role: "WordPress Developer (Freelance)",
    company: "South Korean Freelance Team (Remote)",
    period: "March 2024 – September 2024",
    bullets: [
      "Built and maintained WordPress websites for international clients.",
      "Customized themes and plugins for unique client requirements.",
      "Performed technical SEO, optimization, and debugging.",
      "Coordinated with remote teams across multiple time zones.",
      "Implemented custom REST endpoints for headless front-ends.",
    ],
  },
  {
    role: "WordPress Developer",
    company: "IT Department, Austrian Church",
    period: "October 2024 – Present",
    bullets: [
      "Developed and maintained modern WordPress websites for events and announcements.",
      "Enhanced performance, accessibility, and mobile responsiveness.",
      "Conducted security audits and managed backups.",
      "Collaborated with leadership and media teams for UX improvements.",
      "Introduced headless-ready architecture for future React/Next.js expansion.",
    ],
  },
  {
    role: "Full Stack Developer",
    company: "Trace Tech Communications — Lagos, Nigeria",
    period: "February 2022 – August 2023",
    bullets: [
      "Built WordPress websites with PHP and JavaScript enhancements.",
      "Created custom plugins and optimized themes.",
      "Improved technical SEO and content workflows.",
      "Provided full-stack debugging (front-end + back-end).",
      "Gained experience structuring WordPress as a content API.",
    ],
  },
  {
    role: "IT Manager",
    company: "TNCCC — Lagos, Nigeria",
    period: "January 2021 – February 2022",
    bullets: [
      "Built and managed the organization's WordPress website with high uptime.",
      "Integrated online payments and optimized mobile UX.",
      "Led digital marketing efforts increasing online reach by 1000%.",
      "Maintained full technical operations of the website.",
    ],
  },
];

export const education = {
  degree: "Bachelor of Science — Human Physiology",
  school: "Madonna University",
  period: "2016 – 2020",
};

export const certifications = [
  "WordPress Development & Management",
  "Full Stack Web Development",
  "PHP & MySQL Professional",
  "Git and GitHub Professional",
];

export const skills = {
  wordpress: [
    "Custom Themes",
    "Custom Plugins",
    "Elementor & Gutenberg",
    "WooCommerce",
    "SEO & Speed Optimization",
    "Website Security",
    "Debugging & Maintenance",
    "Headless WordPress / Headless CMS",
    "REST API / API Integration for React & Next.js",
  ],
  frontend: ["HTML5", "CSS3", "JavaScript", "React.js", "Next.js", "Tailwind CSS", "Bootstrap"],
  backend: ["PHP", "Laravel", "Node.js"],
  database: ["MySQL", "MongoDB"],
  tools: ["Git", "GitHub", "Performance tools", "Deployment workflows"],
};
