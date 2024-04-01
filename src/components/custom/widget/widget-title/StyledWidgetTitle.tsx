import './StyledWidgetTitle.scss'

export const StyledWidgetTitle: React.FC<React.PropsWithChildren> = function StyledWidgetTitle(props) {
    return <div className='styled-widget-title'>{props.children}</div>
}
