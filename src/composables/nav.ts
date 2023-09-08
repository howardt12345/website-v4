interface NavLink {
  name: string;
  path: string;
}

export const useNavLinks = (): NavLink[] => [
  { name: 'About', path: '/about' },
  { name: 'Photography', path: '/photography' },
  { name: 'Projects', path: '/projects' },
  { name: 'Contact', path: '/contact' },
];
