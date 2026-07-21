export interface NavLink {
  name: string;
  path: string;
  icon: string;
}

const HASH_SECTION_PREFIX = '/#';
const HOME_SECTION_IDS = ['about', 'experience', 'projects', 'contact'];

export const instagramLink = 'https://www.instagram.com/howardt12345/';
export const resumeUrl = '/resume.pdf';

// vue-router ignores hashes, so hash-section links get their active state from the scroll observer.
export const useLinkActive = () => {
  const route = useRoute();
  const { activeSection } = useActiveSection(HOME_SECTION_IDS);

  const isLinkActive = (link: NavLink): boolean => {
    if (link.path.startsWith(HASH_SECTION_PREFIX)) {
      return route.path === '/' && activeSection.value === link.path.slice(HASH_SECTION_PREFIX.length);
    }
    return route.path.startsWith(link.path);
  };

  return { isLinkActive };
};

export const useNavLinks = (): NavLink[] => [
  { name: 'About', path: '/#about', icon: 'circle-user' },
  { name: 'Experience', path: '/#experience', icon: 'briefcase' },
  { name: 'Projects', path: '/#projects', icon: 'code' },
  { name: 'Photography', path: '/photography', icon: 'camera' },
  // TODO: Add blog to nav once the blog section is ready to launch publicly.
  // { name: 'Blog', path: '/blog', icon: 'pen' },
  { name: 'Travel', path: '/travel', icon: 'earth-asia' },
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
