import { ComponentMeta, ComponentStory } from '@storybook/react'
import { Input as InputComponent } from './Input'
import styles from './Input.stories.module.scss'

export default {
    title: 'Input',
    component: InputComponent,
} as ComponentMeta<typeof InputComponent>

const Template: ComponentStory<typeof InputComponent> = (args) => (
    <div className={styles['module']}>
        <div className={styles['container']}>
            <InputComponent {...args} className={styles['input-fwidth']} />
            <InputComponent {...args} />
            <InputComponent {...args} showCount />
            <InputComponent {...args} value='input with value' allowClear />
            <InputComponent {...args} status='warning' />
            <InputComponent {...args} status='error' />
            <InputComponent {...args} disabled />
            <InputComponent {...args} disabled value='qnr input' className={styles['qnr-input']} />
            <InputComponent {...args} value='qnr input' showCount allowClear />
            <InputComponent {...args} disabled value='input example' />
            {/*  */}
            <InputComponent {...args} className={styles['input-swidth']} />
            <InputComponent {...args} className={styles['input-swidth']} />
            <InputComponent {...args} className={styles['input-swidth']} />
            <InputComponent {...args} className={styles['input-swidth']} allowClear />
            <InputComponent {...args} className={styles['input-swidth']} showCount />
            <InputComponent {...args} className={styles['input-swidth']} disabled />
            <InputComponent {...args} className={styles['input-swidth']} status='warning' />
            <InputComponent {...args} className={styles['input-swidth']} status='error' />
        </div>
        <div className={styles['description']}>size: large | middle | small </div>
    </div>
)

export const Input = Template.bind({})

Input.args = {
    size: 'large',
    disabled: false,
    allowClear: false,
    bordered: true,
    showCount: false,
    placeholder: 'type something...',
    defaultValue: '',
    value: '',
    maxLength: 300,
    status: '',
}
