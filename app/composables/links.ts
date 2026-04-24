export interface NavLink {
  name: string;
  path: string;
  icon: string;
}

export const instagramLink = 'https://www.instagram.com/howardt12345/';
export const resumeUrl = '/resume.pdf';

export const useNavLinks = (): NavLink[] => [
  { name: 'About', path: '/#about', icon: 'circle-user' },
  { name: 'Experience', path: '/#experience', icon: 'briefcase' },
  { name: 'Projects', path: '/#projects', icon: 'code' },
  { name: 'Photography', path: '/photography', icon: 'camera' },
  // { name: 'Blog', path: '/blog', icon: 'pen' },
  { name: 'Contact', path: '/#contact', icon: 'at' },
];

export const useSocialLinks = (): NavLink[] => [
  { name: 'GitHub', path: 'https://github.com/howardt12345', icon: 'fab fa-github' },
  {
    name: 'LinkedIn',
    path: 'https://www.linkedin.com/in/howardt12345/',
    icon: 'fab fa-linkedin',
  },
  {
    name: 'Instagram',
    path: 'https://www.instagram.com/howardt12345/',
    icon: 'fab fa-instagram',
  },
  {
    name: 'Dribbble',
    path: 'https://dribbble.com/howardt12345',
    icon: 'fab fa-dribbble',
  },
  {
    name: 'Redbubble',
    path: 'https://www.redbubble.com/people/howardt12345/shop',
    icon: 'custom:redbubble',
  },
];
