import style from './StyledWidgetTitle.module.scss'

export const StyledWidgetTitle: React.FC<React.PropsWithChildren> = function StyledWidgetTitle(props) {
    return <div className={style['styled-widget-title']}>{props.children}</div>
}
