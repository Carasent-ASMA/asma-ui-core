import { StyledLabel } from './StyledLabel'

import { StyledWidgetTitle } from 'src/components/custom/widget/widget-title/StyledWidgetTitle'

export default {
    title: 'DataDisplay/Label',
    component: StyledLabel,
}

export const Label = () => (
    <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '10px' }}>
            <StyledWidgetTitle>Label/Highlighting</StyledWidgetTitle>
            <StyledLabel dataTest='label-good' style={{ background: 'var(--colors-jade-600)', color: 'white' }}>
                Good
            </StyledLabel>
            <StyledLabel dataTest='label-network' style={{ background: 'purple', color: 'white' }}>
                Network
            </StyledLabel>
            <StyledLabel dataTest='label-attention' style={{ background: 'yellow', color: '#333' }}>
                Attention
            </StyledLabel>
            <StyledLabel dataTest='label-warning' style={{ background: 'salmon', color: 'black' }}>
                Warning
            </StyledLabel>
        </div>

        {/*  */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '10px' }}>
            <StyledWidgetTitle>Label/General</StyledWidgetTitle>
            <StyledLabel dataTest='label-admin'>Admin</StyledLabel>
            <StyledLabel dataTest='label-parent'>Parent</StyledLabel>
            <StyledLabel dataTest='label-linked'>Linked</StyledLabel>
            <StyledLabel dataTest='label-onClick' onClick={() => alert('Click!')}>
                Styled Label + onClick handler
            </StyledLabel>
        </div>
    </>
)
