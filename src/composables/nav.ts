interface NavLink {
  name: string;
  path: string;
  icon: string;
}

export const useNavLinks = (): NavLink[] => [
  { name: 'About', path: '/about', icon: 'circle-user' },
  { name: 'Photography', path: '/photography', icon: 'camera' },
  { name: 'Projects', path: '/projects', icon: 'code' },
  { name: 'Contact', path: '/contact', icon: 'at' },
];
