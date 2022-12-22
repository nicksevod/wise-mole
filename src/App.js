import './App.scss';
import React from 'react';

const cloneDeep = require('lodash/cloneDeep');

const startField = [
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 3, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 2, 2, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 2, 2, 3, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 2, 1, 2, 1, 1, 2, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1],
  [1, 2, 2, 2, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 2, 5, 5, 1],
  [1, 2, 3, 2, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 5, 1],
  [1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 4, 1, 1, 2, 2, 5, 5, 1],
  [0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
];

const types = {
  0: {
    type: 'outside',
    current: null,
  },
  1: {
    type: 'wall',
    current: null,
  },
  2: {
    type: 'empitness',
    current: null,
  },
  3: {
    type: 'empitness',
    current: 'box',
  },
  4: {
    type: 'empitness',
    current: 'mole',
  },
  5: {
    type: 'boxPlace',
    current: null,
  },
  6: {
    type: 'boxPlace',
    current: 'box',
  },
  7: {
    type: 'boxPlace',
    current: 'mole',
  },
};

function App() {
  const [field, setField] = React.useState(startField);
  const [location, setLocation] = React.useState([8, 11]);
  const [steps, setSteps] = React.useState(0);
  const [boxSteps, setBoxSteps] = React.useState(0);
  const [states, setStates] = React.useState([{ field: [startField], steps, boxSteps, location }]);

  const getNext = ([x, y], direction) => {
    switch (direction) {
      case 'up':
        return [
          [x - 1, y],
          [x - 2, y],
        ];
      case 'down':
        return [
          [x + 1, y],
          [x + 2, y],
        ];
      case 'left':
        return [
          [x, y - 1],
          [x, y - 2],
        ];
      case 'right':
        return [
          [x, y + 1],
          [x, y + 2],
        ];
      default:
        return [
          [x, y],
          [x, y],
        ];
    }
  };

  const isAvailable = ([x, y]) => {
    console.log(x, y);
    if (field[x] === undefined || field[x][y] === undefined) {
      return false;
    }
    const type = types[field[x][y]];

    return type.type !== 'outside' && type.type !== 'wall';
  };

  const handleMakeMove = (direction) => {
    const [[x2, y2], [x3, y3]] = getNext(location, direction);

    if (field[x2] === undefined || field[x2][y2] === undefined) {
      return;
    }
    const p1 = field[location[0]][location[1]];
    const p2 = field[x2][y2];

    if (p2 === 2 || p2 === 5) {
      const setData = async () => {
        await setField((prev) => {
          const newField = cloneDeep(prev);
          newField[x2][y2] = p2 === 2 ? 4 : 7;
          newField[location[0]][location[1]] = p1 === 4 ? 2 : 5;
          return newField;
        });
        await setLocation([x2, y2]);
        await setSteps((prev) => prev + 1);
        await setStates((prev) => [{ field, steps, boxSteps, location }, ...prev]);
      };
      setData();
    }

    if (field[x3] === undefined || field[x3][y3] === undefined) {
      return;
    }
    const p3 = field[x3][y3];

    if ((p2 === 3 || p2 === 6) && (p3 === 2 || p3 === 5)) {
      const setData2 = async () => {
        await setField((prev) => {
          const newField = cloneDeep(prev);
          newField[location[0]][location[1]] = p1 === 4 ? 2 : 5;
          newField[x2][y2] = p2 === 3 ? 4 : 7;
          newField[x3][y3] = p3 === 2 ? 3 : 6;
          return newField;
        });
        await setLocation([x2, y2]);
        await setSteps((prev) => prev + 1);
        await setBoxSteps((prev) => prev + 1);
        await setStates((prev) => [{ field, steps, boxSteps, location }, ...prev]);
      };
      setData2();
    }
  };

  const onClickBack = () => {
    if (states.length > 1) {
      const setData3 = async () => {
        await setField(states[0].field);
        await setSteps(states[0].steps);
        await setBoxSteps(states[0].boxSteps);
        await setLocation(states[0].location);
        await setStates((prev) => prev.slice(1));
      };
      setData3();
    }
  };

  return (
    <div className="wrapper">
      <table className="field">
        <tbody>
          {field.map((row, i) => (
            <tr key={'row' + i}>
              {row.map((el, ind) => (
                <td key={'el' + String(i) + String(ind)}>
                  <img src={require(`./assets/${el}.svg`)} alt="Cell" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="navigation">
        <button onClick={() => handleMakeMove('up')}>↑</button>
        <div>
          <button onClick={() => handleMakeMove('left')}>{'<'}</button>
          <button onClick={() => handleMakeMove('down')}>↓</button>
          <button onClick={() => handleMakeMove('right')}>{'>'}</button>
        </div>
      </div>
      <div className="info">
        <p>Шагов: {steps}</p>
        <p>Шагов c грузом: {boxSteps}</p>
        <button onClick={onClickBack}>{'< Назад'}</button>
      </div>
    </div>
  );
}

export default App;
