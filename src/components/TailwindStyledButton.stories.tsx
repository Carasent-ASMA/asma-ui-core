import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { TailwindStyledButton } from './StyledButton';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Atoms/TailwindButton',
  component: TailwindStyledButton,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
} as ComponentMeta<typeof TailwindStyledButton>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof TailwindStyledButton> = (args) => (
  <TailwindStyledButton {...args}>Tailwind</TailwindStyledButton>
);

export const Contained = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Contained.args = {
  variant: 'contained',
};

export const Outlined = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Outlined.args = {
  variant: 'outlined',
};
