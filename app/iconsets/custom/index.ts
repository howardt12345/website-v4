import { h } from 'vue';
import type { Component } from 'vue';
import type { IconSet, IconProps } from 'vuetify';
import redbubble from './redbubble.vue';

const customSvgs: Record<string, Component> = {
  redbubble,
};

export const customIcons: IconSet = {
  component: (props: IconProps) => {
    const icon = customSvgs[props.icon as string];
    return h(props.tag, icon ? [h(icon, { class: 'v-icon__svg' })] : []);
  },
};
