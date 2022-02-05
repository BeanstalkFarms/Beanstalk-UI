import React from 'react';

const DropDown = () => {
    const [show, setShow] = React.useState(false);
    const [selected, setSelected] = React.useState('Greater Than');

    const onSelectClick = () => setShow(!show);
    const onSelectChoice = (choice: string) => setSelected(choice);

    return (
      <div>
        <div role="button" style={{ cursor: 'pointer' }} onClick={() => onSelectClick()} onKeyDown={() => onSelectClick()} tabIndex={0}>{selected}</div>
        {
          show ?
            <div>
              <div role="button" onClick={() => onSelectChoice('Greater Than')} onKeyDown={() => onSelectChoice('Greater Than')} tabIndex={-1}>Greater Than</div>
              <div role="button" onClick={() => onSelectChoice('Less Than')} onKeyDown={() => onSelectChoice('Less Than')} tabIndex={-2}>less Than</div>
            </div>
          :
          null
        }
      </div>
    );
};

export default DropDown;
