import { FormatTooltip, QuestionModule } from './index'

export default function DataBalanceModule(props) {

  const spanContent = (
    <span>
      {props.content !== undefined
        ? props.content
        : <div className='BalanceModule-balanceContent' style={props.style}>{props.balance}</div>
      }
    </span>
  )

  const balanceSection = (
    props.balanceDescription !== undefined
      ? <FormatTooltip
          margin={props.margin}
          placement={props.placement !== undefined ? props.placement : 'right'}
          title={props.balanceDescription}
        >
          {spanContent}
        </FormatTooltip>
      : spanContent
  )

  return (
    <div>
      <div className={'BalanceModule-title' + (props.swerve !== undefined ? ' TokenBalanceModule-header' : '')} style={props.style}>
        {props.title}
        <QuestionModule description={props.description} margin={props.questionMargin} widthTooltip={props.widthTooltip}/>
      </div>
      <div className={'BalanceModule-balance' + (props.swerve !== undefined ? ' TokenBalanceModule-content' : '')} style={props.style}>
        {balanceSection}
      </div>
    </div>
  )
}

DataBalanceModule.defaultProps = {
  questionMargin: '-8px 0 0 -1px'
}
