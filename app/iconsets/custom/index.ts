import { h } from 'vue';
import type { IconSet, IconAliases, IconProps } from 'vuetify';
import redbubble from './redbubble.vue';

const customSvgs = {
  redbubble,
};

export const customIcons: IconSet = {
  component: (props: IconProps) =>
    h(props.tag, [
      h(customSvgs[props.icon as string], {
        class: 'v-icon__svg',
      }),
    ]),
};
